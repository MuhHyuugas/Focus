import { NotificationRepository } from "../repositories/NotificationRepository";
import { Notification } from "../../domain/entities/Notification";

export class GetNotificationsUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(): Promise<Notification[]> {
    return this.notificationRepository.getNotifications();
  }
}
