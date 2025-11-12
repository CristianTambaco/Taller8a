import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/presentation/hooks/useAuth";

export default function RootLayout() {
  const { usuario, cargando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine de cargar
    if (cargando) return;

    // Determinar si estamos en rutas de auth
    const enAuth = segments[0] === "auth";

    // REGLA 1: Si NO hay usuario y NO está en auth → Redirigir a login
    if (!usuario && !enAuth) {
      router.replace("/auth/login");
    }
    // REGLA 2: Si HAY usuario y está en auth → Redirigir a tabs
    else if (usuario && enAuth) {
      router.replace("/(tabs)");
    }
  }, [usuario, segments, cargando]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="recipe" options={{ headerShown: false }} />
    </Stack>
  );
}
