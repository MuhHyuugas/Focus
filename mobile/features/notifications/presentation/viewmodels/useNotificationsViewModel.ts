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

      // Mark all as read immediately when loading
      const unread = notifs.filter((n) => !n.read);
      if (unread.length > 0) {
        for (const u of unread) {
          await notificationRepository.markAsRead(u.id);
        }
        // Update local object status so UI reflects right away if needed,
        // though typically we just want to clear the global badge.
        notifs.forEach((n) => (n.read = true));
      }

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

    const { medicationId } = notification.data;
    if (!medicationId) return;

    try {
      await notificationRepository.markAsRead(notification.id);
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Find med name if possible
      const allMeds = await medRepository.getMedications();
      const med = allMeds.find((m) => m.id === medicationId);
      const medName = med ? med.name : undefined;

      await medRepository.markDoseTaken(
        medicationId,
        timeStr,
        dateStr,
        timeStr, // actual time
        medName,
      );
      await loadNotifications();
    } catch (error) {
      console.error("Error marking dose:", error);
    }
  };

  return {
    notifications,
    loading,
    markAsTaken,
    refresh: loadNotifications,
  };
}
