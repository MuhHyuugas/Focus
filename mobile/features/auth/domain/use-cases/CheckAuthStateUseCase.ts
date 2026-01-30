import { AuthRepository } from "../repositories/AuthRepository";

// classe que executa o caso de uso de verificação de estado de autenticação
export class CheckAuthStateUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<boolean> {
    return await this.authRepository.isAuthenticated();
  }
}
