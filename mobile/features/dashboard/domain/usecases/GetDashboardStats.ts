import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";
import { ReportRepository } from "@/features/report/domain/repositories/ReportRepository";

export class GetDashboardStats {
  constructor(
    private medRepository: MedicationRepository,
    private sideEffectRepository: SideEffectRepository,
    private reportRepository: ReportRepository,
  ) { }

  async execute(): Promise<{ streakDays: number; topSideEffect: string }> {
    const streakDays = await this.calculateStreak();
    const topSideEffect = await this.getTopSideEffect();

    return { streakDays, topSideEffect };
  }

  private async calculateStreak(): Promise<number> {
    try {
      const allTaken = await this.medRepository.getAllTakenDoses();
      const dailyMarks = await this.reportRepository.getMarkedDatesArray();

      // Merge taken doses dates and daily marks dates
      const combinedDates = [...allTaken.map((d) => d.date), ...dailyMarks];

      const uniqueDates = Array.from(new Set(combinedDates)).sort(
        (a, b) => b.localeCompare(a),
      );

      let streak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      let currentDateToCheck = uniqueDates.includes(today) ? today : yesterday;

      if (uniqueDates.includes(currentDateToCheck)) {
        streak = 1;
        let checkDate = new Date(currentDateToCheck);

        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split("T")[0];
          if (uniqueDates.includes(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
      return streak;
    } catch (e) {
      console.error("Error calculating streak", e);
      return 0;
    }
  }

  private async getTopSideEffect(): Promise<string> {
    try {
      const sideEffects = await this.sideEffectRepository.getSideEffects();
      if (sideEffects.length > 0) {
        const counts: Record<string, number> = {};
        sideEffects.forEach((se) => {
          counts[se.description] = (counts[se.description] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
      }
      return "Nenhum";
    } catch (e) {
      console.error("Error getting top side effect", e);
      return "Nenhum";
    }
  }
}
