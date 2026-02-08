import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { User } from "../../domain/entities/User";

export class UpdateUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(user: User): Promise<void> {
    return this.authRepository.saveUser(user);
  }
}
