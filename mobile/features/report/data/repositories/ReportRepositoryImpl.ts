import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { ReportRepository } from "../../domain/repositories/ReportRepository";

// classe que implementa a interface ReportRepository
export class ReportRepositoryImpl implements ReportRepository {
  private medRepository = new MedicationRepositoryImpl();

  // função que pega as datas marcadas
  async getMarkedDates(): Promise<Record<string, any>> {
    try {
      const doses = await this.medRepository.getAllTakenDoses();

      const markedDates: Record<string, any> = {};

      doses.forEach((dose) => {
        markedDates[dose.date] = {
          selected: true,
          marked: true,
          selectedColor: "#179A9B",
        };
      });

      return markedDates;
    } catch (e) {
      console.error("Error reading marked dates", e);
      return {};
    }
  }

  // função que salva as datas marcadas - No longer needed as we derive from doses
  async saveMarkedDates(dates: any): Promise<void> {
    // No-op or deprecate
  }

  //TODO: envia dados para o backend/banco de dados online
  async syncData(): Promise<void> {
    console.log("Syncing data with remote database...");
  }

  // função que limpa as datas marcadas (memoria local)
  async clearData(): Promise<void> {
    // Handled by MedicationRepository clearing doses
  }
}
