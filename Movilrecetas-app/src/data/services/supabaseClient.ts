import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

/**
 * Cliente de Supabase
 *
 * Este es el ÚNICO lugar donde configuramos la conexión a Supabase.
 * Todas las demás partes de la app importan este cliente.
 *
 * IMPORTANTE: El polyfill DEBE importarse ANTES de createClient
 */

// Obtenemos las credenciales de Supabase desde las variables de entorno
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validamos que las variables de entorno estén configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase URL or Anon Key is not defined in environment variables" +
      "Please make sure to set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
  );
}

/**
 * Crear cliente de Supabase con configuración personalizada
 */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    // Refrescar token automáticamente cuando expire
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
