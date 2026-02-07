import { SideEffectRepository } from "../repositories/SideEffectRepository";

export class DeleteSideEffect {
  constructor(private repository: SideEffectRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.deleteSideEffect(id);
  }
}
