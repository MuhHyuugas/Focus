import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";

export class ClearMedicationHistory {
  constructor(private sideEffectRepository: SideEffectRepository) {}

  async execute(medId: string): Promise<void> {
    await this.sideEffectRepository.deleteSideEffectsByMedicationId(medId);
  }
}
