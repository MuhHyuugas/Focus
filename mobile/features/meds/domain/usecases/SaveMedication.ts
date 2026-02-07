import { Medication } from "@/features/meds/domain/entities/Medication";
import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { NotificationService } from "@/features/notifications/domain/services/NotificationService";

export class SaveMedication {
  constructor(
    private medicationRepository: MedicationRepository,
    private notificationService: NotificationService,
  ) {}

  async execute(medication: Medication): Promise<void> {
    // salva no banco de dados
    await this.medicationRepository.saveMedication(medication);

    // agenda as notificações
    try {
      await this.notificationService.scheduleMedicationReminders(medication);
    } catch (error) {
      console.warn(
        "SaveMedication UseCase: Error scheduling notifications:",
        error,
      );
    }
  }
}
