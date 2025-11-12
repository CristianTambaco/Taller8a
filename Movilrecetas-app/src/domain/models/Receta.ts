/**
 * Modelo de Receta
 * Representa una receta de cocina con toda su información
 */

export interface Receta {
  id: string; // UUID único
  titulo: string; // Nombre de la receta
  descripcion: string; // Descripción detallada
  ingredientes: string[]; // Array de ingredientes
  chef_id: string; // ID del chef que la creó
  imagen_url?: string; // URL opcional de la imagen
  created_at: string; // ISO string de fecha de creación
}
