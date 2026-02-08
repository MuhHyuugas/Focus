import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { ReportRepository } from "../../domain/repositories/ReportRepository";
import { DatabaseService } from "@/data/local/DatabaseService";
import { AuthRepositoryImpl } from "@/features/auth/data/AuthRepositoryImpl";
import api from "@/lib/api";
import * as crypto from "expo-crypto";

export class ReportRepositoryImpl implements ReportRepository {
  private medRepository = new MedicationRepositoryImpl();
  private authRepository = new AuthRepositoryImpl();
  private db = DatabaseService.getInstance();

  private async _getUserId(): Promise<string> {
    const user = await this.authRepository.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    return user.id;
  }

  async getMarkedDatesArray(): Promise<string[]> {
    try {
      const marks = await this.db.executeQuery("SELECT data FROM daily_marks");
      return marks.map((m: any) => m.data);
    } catch (e) {
      console.error("Error getting marked dates array", e);
      return [];
    }
  }

  async getMarkedDates(): Promise<Record<string, any>> {
    try {
      const doses = await this.medRepository.getAllTakenDoses();
      const marks = await this.db.executeQuery("SELECT data FROM daily_marks");

      const markedDates: Record<string, any> = {};

      doses.forEach((dose) => {
        markedDates[dose.date] = {
          selected: true,
          marked: true,
          selectedColor: "#179A9B",
        };
      });

      marks.forEach((mark: any) => {
        // Ensure format is YYYY-MM-DD
        const dateKey = mark.data.split("T")[0];

        if (!markedDates[dateKey]) {
          markedDates[dateKey] = {
            selected: true,
            marked: true,
            selectedColor: "#179A9B",
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
      const existing = await this.db.executeQuery(
        "SELECT id FROM daily_marks WHERE data = ?",
        [date],
      );

      if (existing.length > 0) {
        await this.db.executeQuery("DELETE FROM daily_marks WHERE data = ?", [
          date,
        ]);
        // Note: Backend doesn't have DELETE for DailyMark yet in my implementation,
        // we'd need to add it or just ignore deletions for now to keep it simple.
      } else {
        const id = crypto.randomUUID();
        const now = Date.now();
        await this.db.executeQuery(
          "INSERT INTO daily_marks (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
          [id, date, now, now],
        );

        // Sync to backend (Non-blocking)
        this._syncMarkToBackend(id, date).catch((err) =>
          console.error("Failed to sync mark to backend:", err),
        );
      }
    } catch (e) {
      console.error("Error toggling marked date", e);
    }
  }

  private async _syncMarkToBackend(id: string, date: string) {
    try {
      const userId = await this._getUserId();
      console.log(`[Sync] Sending mark. User: ${userId}, Date: ${date}`);

      await api.post("/api/DailyMarks", {
        id,
        usuarioId: userId,
        data: date,
      });
      console.log(`[Sync] Daily mark synced: ${date}`);
    } catch (e) {
      console.error("Daily mark sync failed (Offline?):", e);
    }
  }

  async syncData(): Promise<void> {
    try {
      console.log("ReportRepository: Syncing daily marks...");
      const userId = await this._getUserId();
      const response = await api.get(`/api/DailyMarks?usuarioId=${userId}`);
      const marks = response.data;

      if (Array.isArray(marks)) {
        for (const mark of marks) {
          // Upsert into SQLite
          const existing = await this.db.executeQuery(
            "SELECT id FROM daily_marks WHERE id = ?",
            [mark.id],
          );

          if (existing.length === 0) {
            // Check by date to avoid duplicates if ID differs
            const byDate = await this.db.executeQuery(
              "SELECT id FROM daily_marks WHERE data = ?",
              [mark.data],
            );

            if (byDate.length === 0) {
              await this.db.executeQuery(
                "INSERT INTO daily_marks (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)",
                [mark.id, mark.data, Date.now(), Date.now()],
              );
            }
          }
        }
        console.log(`ReportRepository: Synced ${marks.length} marks.`);
      }
    } catch (e) {
      console.error("ReportRepository: Error syncing daily marks:", e);
    }
  }

  async clearData(): Promise<void> {
    await this.db.executeQuery("DELETE FROM daily_marks");
  }
}
