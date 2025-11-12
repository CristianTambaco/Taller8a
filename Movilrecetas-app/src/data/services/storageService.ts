import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * StorageService - Servicio de almacenamiento multiplataforma
 *
 * Maneja el almacenamiento local de forma consistente entre:
 * - React Native (usando AsyncStorage)
 * - Web (usando localStorage como fallback)
 */
export class StorageService {
  /**
   * Guardar un valor
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error guardando en storage:", error);
    }
  }

  /**
   * Obtener un valor
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Error obteniendo del storage:", error);
      return null;
    }
  }

  /**
   * Eliminar un valor
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error eliminando del storage:", error);
    }
  }

  /**
   * Limpiar todo el storage (usar con cuidado)
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error limpiando storage:", error);
    }
  }

  /**
   * Guardar objeto como JSON
   */
  static async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error guardando objeto en storage:", error);
    }
  }

  /**
   * Obtener objeto desde JSON
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error obteniendo objeto del storage:", error);
      return null;
    }
  }

  // Keys específicos para la gestión de sesión
  static readonly SESSION_USER_KEY = "cookly_current_user";
  static readonly SESSION_REMEMBER_KEY = "cookly_remember_session";

  /**
   * Limpiar todos los datos de sesión
   */
  static async limpiarDatosSesion(): Promise<void> {
    try {
      await Promise.all([
        StorageService.removeItem(StorageService.SESSION_USER_KEY),
        StorageService.removeItem(StorageService.SESSION_REMEMBER_KEY),
        StorageService.removeItem("pending_user_role"),
        StorageService.removeItem("pending_user_email"),
      ]);
    } catch (error) {
      console.error("Error limpiando datos de sesión:", error);
    }
  }
}
