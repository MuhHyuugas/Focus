import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";

export class SyncCatalog {
  constructor(private medicationRepository: MedicationRepository) {}

  async execute(): Promise<void> {
    try {
      await this.medicationRepository.syncCatalog();
    } catch (error) {
      console.warn("SyncCatalog UseCase: Sync failed", error);
    }
  }
}
