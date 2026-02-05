import { Medication } from "../entities/Medication";

export interface MedicationRepository {
  getMedications(): Promise<Medication[]>;
  saveMedication(medication: Medication): Promise<void>;
  deleteMedication(id: string): Promise<void>;
  clearAll(): Promise<void>;
  markDoseTaken(
    medId: string,
    time: string,
    date: string,
    actualTakenTime?: string,
    medName?: string,
    mood?: number,
    anxiety?: boolean,
    focus?: number,
    notes?: string
  ): Promise<void>;
  getTakenDoses(date: string): Promise<
    {
      medId: string;
      time: string;
      date: string;
      actualTakenTime?: string;
      medName?: string;
    }[]
  >;
  getAllTakenDoses(): Promise<
    {
      medId: string;
      time: string;
      date: string;
      actualTakenTime?: string;
      medName?: string;
    }[]
  >;
  markDateAsTaken(date: string): Promise<void>;
  syncCatalog(): Promise<void>;
  searchCatalog(query: string): Promise<{ id: string; name: string; defaultDosage: string }[]>;
}
