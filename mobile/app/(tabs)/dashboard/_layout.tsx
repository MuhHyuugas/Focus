import { Stack } from "expo-router";

export default function DashboardStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="newEffect"
        options={{ headerShown: true, title: "Novo Efeito" }}
      />
    </Stack>
  );
}
