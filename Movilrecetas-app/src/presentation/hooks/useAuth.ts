import { useEffect, useState } from "react";
import { StorageService } from "../../data/services/storageService";
import { Usuario } from "../../domain/models/Usuario";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

// Crear UNA SOLA instancia del UseCase
// Esto es importante para no crear múltiples suscripciones
const authUseCase = new AuthUseCase();

/**
 * useAuth - Hook de Autenticación
 *
 * Este hook es el puente entre la UI y la lógica de negocio.
 * Maneja el estado de autenticación de forma reactiva.
 *
 * ESTADOS:
 * - usuario: Usuario actual o null
 * - cargando: true mientras verifica sesión inicial
 *
 * MÉTODOS:
 * - registrar: Crear nuevo usuario
 * - iniciarSesion: Login
 * - cerrarSesion: Logout
 *
 * HELPERS:
 * - esChef: Boolean para validaciones rápidas
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // AL MONTAR: Verificar si hay sesión persistente
    verificarSesionInicial();

    // SUSCRIBIRSE: Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange(
      async (user) => {
        setUsuario(user);
        setCargando(false);

        // Si hay usuario activo, guardar en storage para persistencia
        if (user) {
          const recordarSesion = await StorageService.getItem(
            StorageService.SESSION_REMEMBER_KEY
          );
          if (recordarSesion !== "false") {
            await StorageService.setObject(
              StorageService.SESSION_USER_KEY,
              user
            );
          }
        }
      }
    );

    // LIMPIAR: Cancelar suscripción al desmontar
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  /**
   * Verificar sesión inicial (incluyendo persistencia)
   */
  const verificarSesionInicial = async () => {
    try {
      // Primero intentar obtener sesión persistente
      const usuarioPersistente = await authUseCase.verificarSesionPersistente();

      if (usuarioPersistente) {
        setUsuario(usuarioPersistente);
      } else {
        // Si no hay sesión persistente, verificar sesión actual
        const user = await authUseCase.obtenerUsuarioActual();
        setUsuario(user);
      }
    } catch (error) {
      console.log("Error al verificar sesión inicial:", error);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const registrar = async (
    email: string,
    password: string,
    rol: "chef" | "usuario"
  ) => {
    const resultado = await authUseCase.registrar(email, password, rol);

    // Si el registro requiere confirmación de email,
    // guardamos el rol temporalmente para crearlo después
    if (resultado.success && resultado.needsConfirmation) {
      // Guardar el rol usando AsyncStorage para React Native
      await StorageService.setItem("pending_user_role", rol);
      await StorageService.setItem("pending_user_email", email);
    }

    return resultado;
  };

  /**
   * Iniciar sesión
   */
  const iniciarSesion = async (
    email: string,
    password: string,
    recordarSesion: boolean = true
  ) => {
    return await authUseCase.iniciarSesion(email, password, recordarSesion);
  };

  /**
   * Cerrar sesión
   */
  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  /**
   * Crear perfil con rol específico (para usuarios que confirmaron email)
   */
  const crearPerfilConRol = async () => {
    const rolGuardado = (await StorageService.getItem("pending_user_role")) as
      | "chef"
      | "usuario"
      | null;
    const emailGuardado = await StorageService.getItem("pending_user_email");

    if (rolGuardado && emailGuardado && usuario) {
      const resultado = await authUseCase.crearPerfil(
        usuario.id,
        emailGuardado,
        rolGuardado
      );

      if (resultado.success) {
        // Limpiar datos temporales
        await StorageService.removeItem("pending_user_role");
        await StorageService.removeItem("pending_user_email");

        // Forzar actualización del usuario
        const usuarioActualizado = await authUseCase.obtenerUsuarioActual();
        setUsuario(usuarioActualizado);
      }

      return resultado;
    }

    return { success: false, error: "No hay datos de rol pendientes" };
  };

  // Retornar estado y métodos
  return {
    usuario, // Usuario actual o null
    cargando, // Boolean de carga
    registrar, // Función
    iniciarSesion, // Función
    cerrarSesion, // Función
    crearPerfilConRol, // Función para crear perfil con rol específico
    esChef: usuario?.rol === "chef", // Helper
  };
}
