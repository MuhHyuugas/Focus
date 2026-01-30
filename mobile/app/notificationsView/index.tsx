import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useNotificationsViewModel } from "@/features/notifications/presentation/viewmodels/useNotificationsViewModel";
import { Stack } from "expo-router";
import { Bell, Check, Pill } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function NotificationsView() {
  const { notifications, loading, markAsTaken } = useNotificationsViewModel();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Notificações",
          headerShown: true,
          headerBackTitle: "Voltar",
          headerTintColor: "#13203F",
          headerStyle: {
            backgroundColor: "#ffffff",
          },
        }}
      />
      <ScrollView className="flex-1 bg-gray-50 p-4">
        <View className="flex-col gap-4 pb-8">
          {notifications.length === 0 && !loading && (
            <Text className="text-center text-gray-500 mt-10">
              Nenhuma notificação recente.
            </Text>
          )}

          {notifications.map((item) => (
            <View
              key={item.id}
              className={`p-4 rounded-xl border ${
                item.read
                  ? "bg-white border-gray-200"
                  : "bg-blue-50 border-blue-100"
              } flex-row gap-3`}
            >
              <View className="pt-1">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    item.type === "medication_reminder"
                      ? "bg-teal-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    as={item.type === "medication_reminder" ? Pill : Bell}
                    size={20}
                    className={
                      item.type === "medication_reminder"
                        ? "text-teal-600"
                        : "text-gray-600"
                    }
                  />
                </View>
              </View>

              <View className="flex-1 gap-1">
                <View className="flex-row justify-between items-start">
                  <Text className="font-semibold text-gray-900 text-lg">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(item.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <Text className="text-gray-600 leading-tight">{item.body}</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {new Date(item.date).toLocaleDateString("pt-BR")}
                </Text>

                {/* Ações */}
                {item.type === "medication_reminder" && item.data && (
                  <View className="mt-3 flex-row">
                    {item.isTaken ? (
                      <View className="flex-row items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full">
                        <Icon as={Check} size={16} className="text-green-700" />
                        <Text className="text-green-700 font-medium text-sm">
                          Tomado
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => markAsTaken(item)}
                        className="bg-teal-600 px-4 py-2 rounded-lg active:opacity-80 flex-row items-center gap-2"
                      >
                        <Icon as={Pill} size={16} color="white" />
                        <Text className="text-white font-medium">
                          Marcar como tomado
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
