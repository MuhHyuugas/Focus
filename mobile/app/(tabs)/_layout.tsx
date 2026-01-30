import { Tabs } from "expo-router";
import { Calendar, Home, Pill, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { THEME } from "@/lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.foreground,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 0 : 10,
          height: 70 + insets.bottom,
          borderRadius: 20,
        },
        tabBarItemStyle: {
          paddingBottom: 5,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: theme.foreground,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: "Início",
          tabBarIcon: ({ color }) => <Home size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Relatório",
          tabBarIcon: ({ color }) => <Calendar size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mymeds"
        options={{
          title: "Meus Medicamentos",
          tabBarIcon: ({ color }) => <Pill size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="newEffect"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
