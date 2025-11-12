/**
 * Sistema de Diseño - Tokens de Diseño
 * Centraliza colores, espaciados, fuentes y otros valores
 * para mantener consistencia visual en toda la app
 */

export const colors = {
  // Colores principales
  primary: "#4CAF50", // Verde - botones principales
  primaryLight: "#E8F5E9", // Verde claro - fondos
  secondary: "#2196F3", // Azul - acciones secundarias
  danger: "#f44336", // Rojo - eliminar
  warning: "#FF9800", // Naranja - alertas

  // Neutros
  background: "#f5f5f5", // Fondo de la app
  white: "#ffffff",
  black: "#000000",

  // Textos
  textPrimary: "#333333", // Texto principal
  textSecondary: "#666666", // Texto secundario
  textTertiary: "#999999", // Texto deshabilitado

  // Bordes
  border: "#dddddd",
  borderLight: "#eeeeee",

  // Estados
  success: "#4CAF50",
  error: "#f44336",
  info: "#2196F3",
};

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 28,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 20,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4, // Android
  },
};
