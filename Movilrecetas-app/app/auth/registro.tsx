import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/styles/globalStyles";
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from "../../src/styles/theme";

export default function RegistroScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState<"chef" | "usuario">(
    "usuario" // Por defecto: usuario
  );
  const [cargando, setCargando] = useState(false);
  const { registrar } = useAuth();
  const router = useRouter();

  const handleRegistro = async () => {
    // VALIDACIÓN 1: Campos vacíos
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    // VALIDACIÓN 2: Longitud de contraseña
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // REGISTRO
    setCargando(true);
    const resultado = await registrar(email, password, rolSeleccionado);
    setCargando(false);

    if (resultado.success) {
      // Éxito: Redirigir a login
      Alert.alert("Éxito", "Cuenta creada correctamente", [
        { text: "OK", onPress: () => router.replace("/auth/login") },
      ]);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        <Text style={globalStyles.title}>Crear Cuenta</Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* SELECTOR DE ROL */}
        <Text style={styles.labelRol}>Selecciona tu rol:</Text>
        <View style={styles.contenedorRoles}>
          {/* BOTÓN: Usuario */}
          <TouchableOpacity
            style={[
              styles.botonRol,
              rolSeleccionado === "usuario" && styles.botonRolActivo,
            ]}
            onPress={() => setRolSeleccionado("usuario")}
          >
            <Text
              style={[
                styles.textoRol,
                rolSeleccionado === "usuario" && styles.textoRolActivo,
              ]}
            >
              Usuario
            </Text>
          </TouchableOpacity>

          {/* BOTÓN: Chef */}
          <TouchableOpacity
            style={[
              styles.botonRol,
              rolSeleccionado === "chef" && styles.botonRolActivo,
            ]}
            onPress={() => setRolSeleccionado("chef")}
          >
            <Text
              style={[
                styles.textoRol,
                rolSeleccionado === "chef" && styles.textoRolActivo,
              ]}
            >
              Chef
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkVolver}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRol: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  contenedorRoles: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  botonRol: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  botonRolActivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  textoRol: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  textoRolActivo: {
    color: colors.primary,
    fontWeight: "bold",
  },
  linkVolver: {
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
});
