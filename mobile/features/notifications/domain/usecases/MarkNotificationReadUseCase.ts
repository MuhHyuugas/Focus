import { NotificationRepository } from "../repositories/NotificationRepository";

export class MarkNotificationReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(notificationId: string): Promise<void> {
    return this.notificationRepository.markAsRead(notificationId);
  }
}
