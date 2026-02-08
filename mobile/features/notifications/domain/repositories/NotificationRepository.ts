import { Notification } from "../entities/Notification";

export interface NotificationRepository {
  getNotifications(): Promise<Notification[]>;
  addNotification(notification: Notification): Promise<void>;
  markAsRead(id: string): Promise<void>;
}
