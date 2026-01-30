import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { ReportRepository } from "@/features/report/domain/repositories/ReportRepository";
import { AuthRepository } from "../repositories/AuthRepository";

// classe que executa o caso de uso de logout
export class LogoutUseCase {
  constructor(
    private authRepository: AuthRepository,
    private medicationRepository: MedicationRepository,
    private reportRepository: ReportRepository,
  ) {}

  async execute(): Promise<void> {
    await this.medicationRepository.clearAll();
    await this.reportRepository.clearData();
    return await this.authRepository.logout();
  }
}
