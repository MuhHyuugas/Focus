import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { ReportRepository } from "../../domain/repositories/ReportRepository";
import { DatabaseService } from "@/data/local/DatabaseService";
import * as crypto from "expo-crypto";

// classe que implementa a interface ReportRepository
export class ReportRepositoryImpl implements ReportRepository {
  private medRepository = new MedicationRepositoryImpl();
  private db = DatabaseService.getInstance();

  // função que pega as datas marcadas
  async getMarkedDates(): Promise<Record<string, any>> {
    try {
      const doses = await this.medRepository.getAllTakenDoses();
      // Fetch manual daily marks
      const marks = await this.db.executeQuery("SELECT data FROM daily_marks");

      const markedDates: Record<string, any> = {};

      // 1. Add doses
      doses.forEach((dose) => {
        markedDates[dose.date] = {
          selected: true,
          marked: true,
          selectedColor: "#179A9B",
        };
      });

      // 2. Add manual marks (merge or overwrite?)
      // If a date is manually marked, it should also show as selected.
      // If it already has doses, it's already selected.
      // We can use a different color or dot if needed, but for now just ensure it's marked.
      marks.forEach((mark: any) => {
        if (!markedDates[mark.data]) {
          markedDates[mark.data] = {
            selected: true,
            marked: true,
            selectedColor: "#179A9B", // Same color for now
          };
        }
      });

      return markedDates;
    } catch (e) {
      console.error("Error reading marked dates", e);
      return {};
    }
  }

  async toggleMarkedDate(date: string): Promise<void> {
    try {
      // Check if exists
      const existing = await this.db.executeQuery(
        "SELECT id FROM daily_marks WHERE data = ?",
        [date],
      );

      if (existing.length > 0) {
        // Remove
        await this.db.executeQuery("DELETE FROM daily_marks WHERE data = ?", [
          date,
        ]);
      } else {
        // Add
        const id = crypto.randomUUID();
        const now = Date.now();
        await this.db.executeQuery(
          "INSERT INTO daily_marks (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
          [id, date, now, now],
        );
      }
    } catch (e) {
      console.error("Error toggling marked date", e);
    }
  }

  //TODO: envia dados para o backend/banco de dados online
  async syncData(): Promise<void> {
    console.log("Syncing data with remote database...");
  }

  // função que limpa as datas marcadas (memoria local)
  async clearData(): Promise<void> {
    // Handled by MedicationRepository clearing doses, but we should also clear daily_marks?
    // User expectation for "logout" usually clears personal data.
    await this.db.executeQuery("DELETE FROM daily_marks");
  }
}
