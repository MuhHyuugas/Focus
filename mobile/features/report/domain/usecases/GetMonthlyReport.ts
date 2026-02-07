import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { HistoryItem } from "../entities/HistoryItem";

export class GetMonthlyReport {
  constructor(private medicationRepository: MedicationRepository) {}

  async execute(year: string, month: string): Promise<HistoryItem[]> {
    const doses = await this.medicationRepository.getAllTakenDoses();
    const medications = await this.medicationRepository.getMedications();

    const targetPrefix = `${year}-${month}`;

    const filteredDoses = doses.filter((d) => d.date.startsWith(targetPrefix));

    // Sort filteredDoses
    filteredDoses.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });

    // Map to HistoryItem
    return filteredDoses.map((dose, index) => {
      // Find medication to get the name if not present in dose
      const med = medications.find((m) => m.id === dose.medId);

      const [hourStr] = dose.time.split(":");
      const hour = parseInt(hourStr);
      const isPm = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const [, m, day] = dose.date.split("-");

      const nameToDisplay = dose.medName || (med ? med.name : "Desconhecido");

      return {
        id: `${dose.date}-${dose.time}-${index}`,
        medicationName: nameToDisplay,
        date: `${day}.${m}`,
        time: displayHour.toString(),
        meridiem: isPm ? 2 : 1,
      };
    });
  }
}
