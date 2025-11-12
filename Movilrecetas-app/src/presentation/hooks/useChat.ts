// src/presentation/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { ChatUseCase } from "@/src/domain/useCases/chat/ChatUseCase";
import { Mensaje } from "@/src/domain/models/Mensaje";

const chatUseCase = new ChatUseCase();

export const useChat = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<string[]>([]); // Nuevo estado
  const [inputTexto, setInputTexto] = useState(""); // Nuevo estado para el texto del input

  // Ref para mantener el texto actual del input y evitar cierres de efectos con valores antiguos
  const inputTextoRef = useRef(inputTexto);
  inputTextoRef.current = inputTexto;

  // Ref para controlar el temporizador de escritura
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Funciones para manejar el estado de escritura ---
  const iniciarEscritura = useCallback(() => {
    chatUseCase.enviarEventoEscritura(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      // No se llama a enviarEventoEscritura(false) aquí,
      // se considera que dejó de escribir si no hay actividad durante el timeout
      // y no se envía mensaje. Se podría limpiar el evento de la DB aquí si se desea,
      // pero el temporizador en el servidor de eventos lo maneja implícitamente.
    }, 1500); // 1.5 segundos de inactividad para dejar de mostrar el indicador
  }, []);

  const detenerEscritura = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    // No se envía un evento "dejar de escribir" específico,
    // se asume que dejará de escribir si no hay actividad.
    // El servidor de eventos y el cliente limpiarán inactivos.
  }, []);

  // --- Funciones para Mensajes (sin cambios importantes) ---
  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    const mensajesObtenidos = await chatUseCase.obtenerMensajes();
    setMensajes(mensajesObtenidos);
    setCargando(false);
  }, []);

  const enviarMensaje = useCallback(async (contenido: string) => {
    if (!contenido.trim()) return { success: false, error: "El mensaje está vacío" };
    setEnviando(true);
    const resultado = await chatUseCase.enviarMensaje(contenido);
    detenerEscritura(); // Detener escritura al enviar
    setEnviando(false);
    setInputTexto(""); // Limpiar input después de enviar
    return resultado;
  }, [detenerEscritura]);

  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    const resultado = await chatUseCase.eliminarMensaje(mensajeId);
    if (resultado.success) {
      setMensajes(prev => prev.filter(m => m.id !== mensajeId));
    }
    return resultado;
  }, []);

  // --- Efecto para manejar el estado de escritura basado en input ---
  useEffect(() => {
    if (inputTextoRef.current.trim()) {
      iniciarEscritura();
    } else {
      detenerEscritura();
    }
    // No dependemos directamente de inputTextoRef.current,
    // sino del estado inputTexto para disparar este efecto.
    // El ref se actualiza dentro del efecto principal setInputTexto.
  }, [inputTexto, iniciarEscritura, detenerEscritura]); // Dependencias: inputTexto (estado), no ref


  // --- Efecto para suscribirse a mensajes y escritura ---
  useEffect(() => {
    cargarMensajes();

    const desuscribirMensajes = chatUseCase.suscribirseAMensajes((nuevoMensaje) => {
      setMensajes(prev => {
        if (prev.some(m => m.id === nuevoMensaje.id)) {
          return prev;
        }
        return [...prev, nuevoMensaje];
      });
    });

    const desuscribirEscritura = chatUseCase.suscribirseAEscritura((userIds) => {
      // Aquí podrías obtener los emails de los usuarios con ID en userIds
      // Para simplificar, asumiremos que setUsuariosEscribiendo recibe una lista de emails.
      // En una implementación real, necesitarías una función para mapear IDs a emails.
      // Por ahora, lo dejamos como userIds y lo manejamos en la UI.
      // Si tienes acceso al hook de auth o a un store global con usuarios, puedes mapearlos aquí.
      // Por ejemplo:
      // const emailsEscribiendo = await Promise.all(userIds.map(id => fetchEmailById(id)));
      // setUsuariosEscribiendo(emailsEscribiendo);
      // Pero para este ejemplo, lo dejamos como IDs o como una bandera.
      // Lo más práctico es manejar la obtención de emails en el componente de UI si es necesario,
      // o mantener una lista de usuarios activos en el hook.
      // Por simplicidad, dejaremos que el componente maneje la obtención de emails si es necesario.
      setUsuariosEscribiendo(userIds);
    });

    return () => {
      desuscribirMensajes();
      desuscribirEscritura();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [cargarMensajes]);

  // --- Retornar el nuevo estado ---
  return {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    eliminarMensaje,
    recargarMensajes: cargarMensajes,
    usuariosEscribiendo, // <-- Exponer la lista de usuarios escribiendo
    setInputTexto,       // <-- Exponer la función para actualizar el texto del input
    inputTexto,          // <-- Exponer el texto actual del input
  };
};