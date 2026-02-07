import { NotificationService } from "@/features/notifications/domain/services/NotificationService";
import { Medication } from "@/features/meds/domain/entities/Medication";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export class ExpoNotificationService implements NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelMedicationReminders(medicationId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduled) {
        const data =
          notification.content?.data ||
          (notification as any).request?.content?.data;

        if (
          data?.medicationId === medicationId ||
          notification.identifier.startsWith(`med_${medicationId}_`)
        ) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier,
          );
        }
      }
    } catch (error) {
      console.warn("Error cancelling notifications:", error);
    }
  }

  async scheduleMedicationReminders(medication: Medication): Promise<void> {
    // Cancela as notificações anteriores
    await this.cancelMedicationReminders(medication.id);

    const dayMapping: { [key: string]: number } = {
      dom: 0,
      seg: 1,
      ter: 2,
      qua: 3,
      qui: 4,
      sex: 5,
      sab: 6,
    };

    for (const time of medication.times) {
      const [hour, minute] = time.split(":").map(Number);

      if (Platform.OS === "android") {
        for (const day of medication.days) {
          const weekdayDigit = dayMapping[day] + 1; // Dom=1, Seg=2, ..., Sab=7

          await Notifications.scheduleNotificationAsync({
            identifier: `med_${medication.id}_${day}_${time}`,
            content: {
              title: "Hora do remédio! 💊",
              body: `Está na hora de tomar ${medication.name}`,
              sound: true,
              data: { medicationId: medication.id, doseTime: time },
              color: "#179A9B",
            } as any,
            trigger: {
              type: "weekly",
              weekday: weekdayDigit,
              hour,
              minute,
              repeats: true,
              channelId: "default",
            } as any,
          });
        }
      } else {
        for (const day of medication.days) {
          const weekdayDigit = dayMapping[day] + 1;

          await Notifications.scheduleNotificationAsync({
            identifier: `med_${medication.id}_${day}_${time}`,
            content: {
              title: "Hora do remédio! 💊",
              body: `Está na hora de tomar ${medication.name}`,
              sound: true,
              data: { medicationId: medication.id, doseTime: time },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              weekday: weekdayDigit,
              hour,
              minute,
              repeats: true,
            },
          });
        }
      }
    }
  }
}
