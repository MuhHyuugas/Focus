import { useAuthStateViewModel } from "@/features/auth/presentation/viewmodels/useAuthStateViewModel";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import AuthView from "./authView";

export default function App() {
  const { isAuthenticated, isLoading } = useAuthStateViewModel();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#179A9B" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/dashboard" /> : <AuthView />;
}
