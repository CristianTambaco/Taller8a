export interface Mensaje {
  id: string;
  contenido: string;
  usuario_id: string;
  created_at: string;
  // Información del usuario (join)
  usuario?: {
    email: string;
    rol: string;
  };
}
