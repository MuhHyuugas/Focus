import { Notification } from "../../domain/entities/Notification";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Hora do remédio",
    body: "Está na hora de tomar seu Paracetamol (08:00)",
    date: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(), // Today 8:00
    read: false,
    type: "medication_reminder",
    data: {
      medicationId: "med-1",
      doseTime: "08:00",
    },
  },
  {
    id: "notif-2",
    title: "Hora do remédio",
    body: "Está na hora de tomar seu Ibuprofeno (12:00)",
    date: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), // Today 12:00
    read: false,
    type: "medication_reminder",
    data: {
      medicationId: "med-2",
      doseTime: "12:00",
    },
  },
  {
    id: "notif-3",
    title: "Relatório Mensal",
    body: "Seu relatório de saúde de Dezembro está disponível.",
    date: "2025-12-01T09:00:00.000Z",
    read: true,
    type: "system",
  },
];

export class MockNotificationRepository {
  async getNotifications(): Promise<Notification[]> {
    // Sort by date descending
    return Promise.resolve(
      [...MOCK_NOTIFICATIONS].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    );
  }

  async markAsRead(id: string): Promise<void> {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return Promise.resolve();
  }
}
