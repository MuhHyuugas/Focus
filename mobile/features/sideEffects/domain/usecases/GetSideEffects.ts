import { SideEffectRepository } from "../repositories/SideEffectRepository";
import { SideEffect } from "../entities/SideEffect";

export class GetSideEffects {
  constructor(private repository: SideEffectRepository) {}

  async execute(): Promise<SideEffect[]> {
    return await this.repository.getSideEffects();
  }
}
