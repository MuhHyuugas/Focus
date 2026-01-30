import "@/global.css";
import { AuthProvider } from "@/features/auth/presentation/contexts/AuthContext";
import { NotificationRepositoryImpl } from "@/features/notifications/data/NotificationRepositoryImpl";
import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_OPTIONS = {
  title: "Focus",
  headerShown: false,
};

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  setColorScheme("light");

  useEffect(() => {
    async function setupNotifications() {
      // canal de notificação para android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Lembretes de Medicamentos",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // permissão de notificação
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push token for push notification!");
      }

      // handler de notificação
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    setupNotifications();
    // listener de notificação
    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const repo = new NotificationRepositoryImpl();
        const rawData = notification.request.content.data as unknown as Record<
          string,
          any
        >;

        // salva notificação se for de medicamento
        if (rawData?.medicationId) {
          await repo.addNotification({
            id: notification.request.identifier,
            title: notification.request.content.title || "Lembrete",
            body: notification.request.content.body || "",
            date: new Date().toISOString(),
            read: false,
            type: "medication_reminder",
            data: {
              medicationId: String(rawData.medicationId),
              doseTime: String(rawData.doseTime),
            },
          });
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
          <Stack screenOptions={SCREEN_OPTIONS} />
          <StatusBar style="dark" />
          <PortalHost />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}
