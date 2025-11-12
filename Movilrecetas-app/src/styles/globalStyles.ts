import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "./theme";

/**
 * Estilos Globales Reutilizables
 * Componentes comunes usados en toda la aplicación
 */

export const globalStyles = StyleSheet.create({
  // CONTENEDORES
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: spacing.lg,
  },

  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  contentPadding: {
    padding: spacing.md,
  },

  // INPUTS
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },

  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  // BOTONES
  button: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.small,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  // TARJETAS
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },

  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
  },

  // TEXTOS
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  textPrimary: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  textTertiary: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // CHIPS (TAGS)
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },

  chipText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "500",
  },

  // ESTADOS
  emptyState: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
