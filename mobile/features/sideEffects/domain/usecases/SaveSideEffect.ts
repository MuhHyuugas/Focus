import { SideEffectRepository } from "../repositories/SideEffectRepository";
import { SideEffect } from "../entities/SideEffect";

export class SaveSideEffect {
  constructor(private repository: SideEffectRepository) {}

  async execute(sideEffect: SideEffect): Promise<void> {
    await this.repository.saveSideEffect(sideEffect);
  }
}
