import { Medication } from "../entities/Medication";

export interface MedicationRepository {
  getMedications(): Promise<Medication[]>;
  saveMedication(medication: Medication): Promise<void>;
  deleteMedication(id: string): Promise<void>;
  clearAll(): Promise<void>;
  markDoseTaken(medId: string, time: string, date: string): Promise<void>;
  getTakenDoses(
    date: string,
  ): Promise<{ medId: string; time: string; date: string }[]>;
  getAllTakenDoses(): Promise<{ medId: string; time: string; date: string }[]>;
  markDateAsTaken(date: string): Promise<void>;
}
