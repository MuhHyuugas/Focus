import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";

export class MarkDoseTaken {
  constructor(private repository: MedicationRepository) { }

  async execute(
    medId: string,
    scheduledTime: string,
    scheduledDate: string,
    medName: string,
  ): Promise<void> {
    const now = new Date();
    const actualTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    await this.repository.markDoseTaken(
      medId,
      scheduledTime,
      scheduledDate,
      actualTime,
      medName,
    );
    await this.repository.markDateAsTaken(scheduledDate);
  }
}
