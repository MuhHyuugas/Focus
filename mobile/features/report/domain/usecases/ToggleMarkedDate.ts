import { ReportRepository } from "../repositories/ReportRepository";

export class ToggleMarkedDate {
  constructor(private reportRepository: ReportRepository) {}

  async execute(date: string): Promise<void> {
    await this.reportRepository.toggleMarkedDate(date);
  }
}
