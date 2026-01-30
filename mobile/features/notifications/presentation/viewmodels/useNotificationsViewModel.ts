import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { NotificationRepositoryImpl } from "@/features/notifications/data/NotificationRepositoryImpl";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Notification } from "../../domain/entities/Notification";

const notificationRepository = new NotificationRepositoryImpl();
const medRepository = new MedicationRepositoryImpl();

export interface NotificationItem extends Notification {
  isTaken?: boolean;
}

export function useNotificationsViewModel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]); // Array de notificações
  const [loading, setLoading] = useState(true); // Estado de carregamento

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notifs = await notificationRepository.getNotifications(); // Busca as notificações
      const allTakenDoses = await medRepository.getAllTakenDoses(); // Busca as doses tomadas

      const items: NotificationItem[] = notifs.map((n) => {
        let isTaken = false;
        // Verifica se a notificação é um lembrete de medicamento e tem dados
        if (n.type === "medication_reminder" && n.data) {
          // Pega a data da notificação
          const notifDate = n.date.split("T")[0];
          isTaken = allTakenDoses.some(
            (d) =>
              d.medId === n.data?.medicationId &&
              d.date === notifDate &&
              d.time === n.data?.doseTime,
          );
        }
        return { ...n, isTaken };
      });

      setNotifications(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const markAsTaken = async (notification: NotificationItem) => {
    if (
      notification.type !== "medication_reminder" ||
      !notification.data ||
      notification.isTaken
    )
      return;

    const { medicationId, doseTime } = notification.data;
    if (!medicationId || !doseTime) return;

    const dateStr = notification.date.split("T")[0]; //

    await medRepository.markDoseTaken(medicationId, doseTime, dateStr);

    //
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, isTaken: true } : item,
      ),
    );
  };

  return {
    notifications,
    loading,
    markAsTaken,
    refresh: loadNotifications,
  };
}
