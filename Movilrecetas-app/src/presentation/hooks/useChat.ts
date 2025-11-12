import { useState, useEffect, useCallback } from "react";
import { ChatUseCase } from "@/src/domain/useCases/chat/ChatUseCase";
import { Mensaje } from "@/src/domain/models/Mensaje";

const chatUseCase = new ChatUseCase();

export const useChat = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Cargar mensajes históricos
  const cargarMensajes = useCallback(async () => {
    setCargando(true);
    const mensajesObtenidos = await chatUseCase.obtenerMensajes();
    setMensajes(mensajesObtenidos);
    setCargando(false);
  }, []);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (contenido: string) => {
    if (!contenido.trim()) return { success: false, error: "El mensaje está vacío" };

    setEnviando(true);
    const resultado = await chatUseCase.enviarMensaje(contenido);
    setEnviando(false);

    return resultado;
  }, []);

  // Eliminar mensaje
  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    const resultado = await chatUseCase.eliminarMensaje(mensajeId);
    if (resultado.success) {
      setMensajes(prev => prev.filter(m => m.id !== mensajeId));
    }
    return resultado;
  }, []);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    // Cargar mensajes iniciales
    cargarMensajes();

    // Suscribirse a nuevos mensajes
    const desuscribir = chatUseCase.suscribirseAMensajes((nuevoMensaje) => {
      setMensajes(prev => {
        // Evitar duplicados
        if (prev.some(m => m.id === nuevoMensaje.id)) {
          return prev;
        }
        return [...prev, nuevoMensaje];
      });
    });

    // Limpiar suscripción al desmontar
    return () => {
      desuscribir();
    };
  }, [cargarMensajes]);

  return {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    eliminarMensaje,
    recargarMensajes: cargarMensajes,
  };
};
