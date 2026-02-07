import { Medication } from "@/features/meds/domain/entities/Medication";
import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";


export class GetMedications {
  constructor(
    private medicationRepository: MedicationRepository,
    private sideEffectRepository: SideEffectRepository,
  ) {}

  async execute(): Promise<{
    medications: Medication[];
    sideEffectsMap: Record<string, SideEffect[]>;
  }> {
    const medications = await this.medicationRepository.getMedications();
    const allSideEffects = await this.sideEffectRepository.getSideEffects();
    const map: Record<string, SideEffect[]> = {};

    allSideEffects.forEach((effect) => {
      if (!map[effect.medicationId]) {
        map[effect.medicationId] = [];
      }
      map[effect.medicationId].push(effect);
    });

    return { medications, sideEffectsMap: map };
  }
}
