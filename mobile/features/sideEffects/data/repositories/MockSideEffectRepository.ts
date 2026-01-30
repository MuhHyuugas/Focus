import { MOCK_SIDE_EFFECTS } from "@/data/mock/database";
import { SideEffect } from "../../domain/entities/SideEffect";
import { SideEffectRepository } from "../../domain/repositories/SideEffectRepository";

export class MockSideEffectRepository implements SideEffectRepository {
  private sideEffects: SideEffect[] = [...MOCK_SIDE_EFFECTS];

  async getSideEffects(): Promise<SideEffect[]> {
    return Promise.resolve(this.sideEffects);
  }

  async saveSideEffect(sideEffect: SideEffect): Promise<void> {
    this.sideEffects.push(sideEffect);
    return Promise.resolve();
  }

  async updateSideEffect(updatedSideEffect: SideEffect): Promise<void> {
    this.sideEffects = this.sideEffects.map((se) =>
      se.id === updatedSideEffect.id ? updatedSideEffect : se,
    );
    return Promise.resolve();
  }

  async deleteSideEffect(id: string): Promise<void> {
    this.sideEffects = this.sideEffects.filter((se) => se.id !== id);
    return Promise.resolve();
  }
  async getSideEffectsByMedicationId(medId: string): Promise<SideEffect[]> {
    return Promise.resolve(
      this.sideEffects.filter((se) => se.medicationId === medId),
    );
  }

  async deleteSideEffectsByMedicationId(medId: string): Promise<void> {
    this.sideEffects = this.sideEffects.filter(
      (se) => se.medicationId !== medId,
    );
    return Promise.resolve();
  }
}
