import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { User } from "../../domain/entities/User";

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(id: string, password: string): Promise<User> {
    return this.authRepository.login(id, password);
  }
}
