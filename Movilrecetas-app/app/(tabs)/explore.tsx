import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function ExploreRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Navegar inmediatamente cuando se monta el componente
    router.replace("/recipe/crear");
  }, [router]);

  // Mostrar vista vacía mientras navega
  return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
}
