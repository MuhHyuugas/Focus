import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class DeleteUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string): Promise<void> {
    return this.authRepository.deleteUser(userId);
  }
}
