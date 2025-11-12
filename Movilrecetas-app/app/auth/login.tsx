import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { globalStyles } from "../../src/styles/globalStyles";
import { colors, fontSize, spacing } from "../../src/styles/theme";

export default function LoginScreen() {
  // ESTADO LOCAL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(true);

  // HOOKS
  const { iniciarSesion } = useAuth();
  const router = useRouter();

  /**
   * Manejar inicio de sesión
   */
  const handleLogin = async () => {
    // VALIDACIÓN: Campos vacíos
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // INICIO DE SESIÓN
    setCargando(true);
    const resultado = await iniciarSesion(email, password, recordarSesion);
    setCargando(false);

    // MANEJO DE RESULTADO
    if (resultado.success) {
      // Éxito: Redirigir a tabs
      // replace() para que no pueda volver con botón atrás
      router.replace("/(tabs)");
    } else {
      // Error: Mostrar mensaje
      Alert.alert("Error", resultado.error || "No se pudo iniciar sesión");
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        <Text style={styles.titulo}>Recetas App</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none" // No capitalizar
          keyboardType="email-address" // Teclado de email
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Ocultar texto
        />

        {/* Opción para recordar sesión */}
        <View style={styles.recordarSesionContainer}>
          <Switch
            value={recordarSesion}
            onValueChange={setRecordarSesion}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={recordarSesion ? colors.white : colors.white}
          />
          <Text style={styles.recordarSesionTexto}>Recordar sesión</Text>
        </View>

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonLogin,
          ]}
          onPress={handleLogin}
          disabled={cargando} // Deshabilitar mientras carga
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/registro")}>
          <Text style={styles.linkRegistro}>
            ¿No tienes cuenta? Regístrate aquí
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: fontSize.xxxl,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.xxl * 2,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.textSecondary,
  },
  botonLogin: {
    marginTop: spacing.sm,
  },
  linkRegistro: {
    textAlign: "center",
    marginTop: spacing.lg,
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  recordarSesionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  recordarSesionTexto: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
});
