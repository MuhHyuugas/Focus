import { Medication } from "@/features/meds/domain/entities/Medication";
import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";

export class GetNextDose {
  constructor(private repository: MedicationRepository) {}

  async execute(): Promise<{
    med: Medication;
    time: string;
    date: Date;
    timeUntil: string;
  } | null> {
    const treatments = await this.repository.getMedications();
    if (treatments.length === 0) return null;

    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const currentClockTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const takenDosesToday = await this.repository.getTakenDoses(todayISO);
    const weekDaySlugs = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

    let earliestNextDose: { med: Medication; time: string; date: Date } | null =
      null;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date();
      checkDate.setDate(now.getDate() + dayOffset);
      const currentDaySlug = weekDaySlugs[checkDate.getDay()];
      const isCheckingToday = dayOffset === 0;

      const scheduledMedsForDay = treatments.filter((m) =>
        m.days.includes(currentDaySlug),
      );
      let doseCandidates: { med: Medication; time: string; date: Date }[] = [];

      scheduledMedsForDay.forEach((med) => {
        med.times.forEach((time) => {
          const [hour, minute] = time.split(":").map(Number);
          const scheduledDoseDate = new Date(checkDate);
          scheduledDoseDate.setHours(hour, minute, 0, 0);

          if (isCheckingToday) {
            if (time > currentClockTime) {
              const isAlreadyTaken = takenDosesToday.some(
                (t) => t.medId === med.id && t.time === time,
              );
              if (!isAlreadyTaken) {
                doseCandidates.push({ med, time, date: scheduledDoseDate });
              }
            }
          } else {
            doseCandidates.push({ med, time, date: scheduledDoseDate });
          }
        });
      });

      if (doseCandidates.length > 0) {
        doseCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());
        earliestNextDose = doseCandidates[0];
        break;
      }
    }

    if (!earliestNextDose) return null;

    return {
      ...earliestNextDose,
      timeUntil: this.calculateTimeUntil(earliestNextDose.date),
    };
  }

  private calculateTimeUntil(targetDate: Date): string {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    // 5 minutes buffer (300000 ms) - Business Rule
    if (diffMs <= 300000) {
      return "Agora";
    }

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
      const remainingHours = diffHrs % 24;
      return `${diffDays}d ${remainingHours}h`;
    } else {
      return `${diffHrs}h ${diffMins}min`;
    }
  }
}
