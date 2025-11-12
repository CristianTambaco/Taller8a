import { supabase } from "@/src/data/services/supabaseClient";
import { StorageService } from "../../../data/services/storageService";
import { Usuario } from "../../models/Usuario";

/**
 * AuthUseCase - Caso de Uso de Autenticación
 *
 * Contiene toda la lógica de negocio relacionada con autenticación:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Cierre de sesión
 * - Obtener usuario actual
 * - Escuchar cambios de autenticación
 *
 * Este UseCase es el "cerebro" de la autenticación.
 * Los componentes no hablan directamente con Supabase, sino con este UseCase.
 */

export class AuthUseCase {
  /**
   * Registrar nuevo usuario
   *
   * @param email - Email del usuario
   * @param password - Contraseña (mínimo 6 caracteres)
   * @param rol - Tipo de usuario: "chef" o "usuario"
   * @returns Objeto con success y datos o error
   */
  async registrar(email: string, password: string, rol: "chef" | "usuario") {
    try {
      // PASO 1: Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      // Verificar si hubo error
      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // PASO 2: Esperar confirmación de sesión activa
      // Si el usuario requiere confirmación de email, esperamos
      if (!authData.session) {
        // Usuario creado pero necesita confirmar email
        return {
          success: true,
          user: authData.user,
          needsConfirmation: true,
          message: "Revisa tu email para confirmar la cuenta",
        };
      }

      // PASO 3: Guardar información adicional en tabla usuarios
      // SOLO si la sesión está activa (usuario autenticado)
      const { error: upsertError } = await supabase.from("usuarios").upsert(
        {
          id: authData.user.id, // Mismo ID que en Auth
          email: authData.user.email,
          rol: rol, // Chef o usuario
        },
        {
          onConflict: "id", // Si el ID ya existe, actualiza
        }
      );

      if (upsertError) throw upsertError;

      return { success: true, user: authData.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear perfil de usuario (después de confirmación de email)
   *
   * @param userId - ID del usuario autenticado
   * @param email - Email del usuario
   * @param rol - Rol del usuario
   * @returns Resultado de la operación
   */
  async crearPerfil(userId: string, email: string, rol: "chef" | "usuario") {
    try {
      const { error } = await supabase.from("usuarios").upsert(
        {
          id: userId,
          email: email,
          rol: rol,
        },
        {
          onConflict: "id",
        }
      );

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Iniciar sesión
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @param recordarSesion - Si debe mantener la sesión persistente
   * @returns Objeto con success y datos o error
   */
  async iniciarSesion(
    email: string,
    password: string,
    recordarSesion: boolean = true
  ) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Guardar preferencia de recordar sesión
      await StorageService.setItem(
        StorageService.SESSION_REMEMBER_KEY,
        recordarSesion.toString()
      );

      // Si el login es exitoso y tenemos usuario, guardar datos completos
      if (data.user && recordarSesion) {
        const usuarioCompleto = await this.obtenerUsuarioActual();
        if (usuarioCompleto) {
          await StorageService.setObject(
            StorageService.SESSION_USER_KEY,
            usuarioCompleto
          );
        }
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar todos los datos de sesión guardados localmente
      await StorageService.limpiarDatosSesion();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con toda su información
   *
   * @returns Usuario completo o null si no hay sesión
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    try {
      // PASO 1: Obtener usuario de Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // PASO 2: Obtener información completa de tabla usuarios
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", user.id)
        .single(); // Esperamos un solo resultado

      if (error) throw error;
      return data as Usuario;
    } catch (error) {
      console.log("Error al obtener usuario:", error);
      return null;
    }
  }

  /**
   * Verificar si hay una sesión persistente almacenada
   *
   * @returns Usuario guardado localmente o null
   */
  async verificarSesionPersistente(): Promise<Usuario | null> {
    try {
      // Verificar si el usuario quería recordar la sesión
      const recordarSesion = await StorageService.getItem(
        StorageService.SESSION_REMEMBER_KEY
      );

      if (recordarSesion === "false") {
        return null;
      }

      // Intentar obtener sesión de Supabase (que ya maneja AsyncStorage)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Hay sesión válida en Supabase, obtener datos completos
        return await this.obtenerUsuarioActual();
      }

      // No hay sesión válida, limpiar datos locales
      await StorageService.limpiarDatosSesion();

      return null;
    } catch (error) {
      console.log("Error al verificar sesión persistente:", error);
      return null;
    }
  }

  /**
   * Escuchar cambios de autenticación
   *
   * Esta función permite reaccionar en tiempo real cuando:
   * - Un usuario inicia sesión
   * - Un usuario cierra sesión
   * - El token expira y se refresca
   *
   * @param callback - Función que se ejecuta cuando hay cambios
   * @returns Suscripción que debe limpiarse al desmontar
   */
  onAuthStateChange(callback: (usuario: Usuario | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Hay sesión activa: obtener datos completos
        const usuario = await this.obtenerUsuarioActual();

        // Si no hay usuario en la tabla pero sí en auth,
        // significa que el perfil no se creó durante el registro
        if (!usuario && session.user) {
          console.log("Usuario autenticado pero sin perfil...");

          // Verificar si hay un rol pendiente guardado
          let rolPendiente: "chef" | "usuario" = "usuario"; // Por defecto

          const rolGuardado = await StorageService.getItem("pending_user_role");
          if (rolGuardado === "chef" || rolGuardado === "usuario") {
            rolPendiente = rolGuardado;
          }

          console.log("Creando perfil con rol:", rolPendiente);
          // Crear perfil con el rol apropiado
          await this.crearPerfil(
            session.user.id,
            session.user.email || "",
            rolPendiente
          );

          // Volver a intentar obtener el usuario
          const usuarioCreado = await this.obtenerUsuarioActual();
          callback(usuarioCreado);
        } else {
          callback(usuario);
        }
      } else {
        // No hay sesión: retornar null
        callback(null);
      }
    });
  }
}
