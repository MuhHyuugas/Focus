import { Medication } from "@/features/meds/domain/entities/Medication";

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleMedicationReminders(medication: Medication): Promise<void>;
  cancelMedicationReminders(medicationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
}
