import { SideEffect } from "../entities/SideEffect";

export interface SideEffectRepository {
  getSideEffects(): Promise<SideEffect[]>;
  saveSideEffect(sideEffect: SideEffect): Promise<void>;
  updateSideEffect(sideEffect: SideEffect): Promise<void>;
  deleteSideEffect(id: string): Promise<void>;
}
