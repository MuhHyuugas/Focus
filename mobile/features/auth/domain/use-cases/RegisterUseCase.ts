import { RegisterData } from "../entities/RegisterData";
import { AuthRepository } from "../repositories/AuthRepository";

// classe que executa o caso de uso de cadastro
export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(data: RegisterData): Promise<void> {
    // chama o repositorio para salvar os dados
    return await this.authRepository.register(data);
  }
}
