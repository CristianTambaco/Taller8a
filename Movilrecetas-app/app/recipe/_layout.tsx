import { Stack } from "expo-router";

export default function RecipeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="crear"
        options={{
          headerShown: false, // Explícitamente desactivar header
          presentation: "card", // Animación de tarjeta desde abajo
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          headerShown: false, // Explícitamente desactivar header
          presentation: "modal", // Aparece como modal
        }}
      />
    </Stack>
  );
}
