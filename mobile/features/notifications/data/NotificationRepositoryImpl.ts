import { Notification } from "@/features/notifications/domain/entities/Notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationRepository } from "../domain/repositories/NotificationRepository";

const CURRENT_USER_KEY = "@focus:currentUser";

export class NotificationRepositoryImpl implements NotificationRepository {
  private async _getUserId(): Promise<string> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        throw new Error("User not authenticated");
      }
      const user = JSON.parse(userJson);
      return user.id;
    } catch (e) {
      console.error("Error getting user ID", e);
      throw new Error("Failed to get user ID");
    }
  }

  private async _getStorageKey(): Promise<string> {
    const userId = await this._getUserId();
    return `@focus:notifications:${userId}`;
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const key = await this._getStorageKey();
      const jsonValue = await AsyncStorage.getItem(key);
      const items = jsonValue != null ? JSON.parse(jsonValue) : [];

      // Sort desc
      return items.sort(
        (a: Notification, b: Notification) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } catch (e) {
      console.error("Error getting notifications", e);
      return [];
    }
  }

  async addNotification(notification: Notification): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getNotifications();
      items.push(notification);
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error("Error adding notification", e);
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getNotifications();
      const notif = items.find((n) => n.id === id);
      if (notif) {
        notif.read = true;
        await AsyncStorage.setItem(key, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Error marking notification as read", e);
    }
  }
}
