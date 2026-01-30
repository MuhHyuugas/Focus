import { MOCK_MARKED_DATES, MOCK_MEDICATIONS } from "@/data/mock/database";
import { Medication } from "../../domain/entities/Medication";
import { MedicationRepository } from "../../domain/repositories/MedicationRepository";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Shared state across instances
const GLOBAL_MEDICATIONS: Medication[] = [...MOCK_MEDICATIONS];
const GLOBAL_TAKEN_DOSES: { date: string; medId: string; time: string }[] = [
  { date: "2025-12-10", medId: "med-1", time: "08:00" },
  { date: "2025-12-10", medId: "med-1", time: "20:00" },
  { date: "2025-12-25", medId: "med-2", time: "12:00" },
  { date: "2025-12-25", medId: "med-2", time: "20:00" },
  { date: "2026-01-05", medId: "med-1", time: "08:00" },
  { date: "2026-01-15", medId: "med-2", time: "12:00" },
  { date: "2026-01-28", medId: "med-1", time: "08:00" },
  { date: "2026-01-28", medId: "med-1", time: "20:00" },
  { date: "2026-01-29", medId: "med-2", time: "12:00" },
];

export class MockMedicationRepository implements MedicationRepository {
  async getMedications(): Promise<Medication[]> {
    return Promise.resolve(GLOBAL_MEDICATIONS);
  }

  async saveMedication(medication: Medication): Promise<void> {
    const index = GLOBAL_MEDICATIONS.findIndex((m) => m.id === medication.id);
    if (index !== -1) {
      GLOBAL_MEDICATIONS[index] = medication;
    } else {
      GLOBAL_MEDICATIONS.push(medication);
    }
    return Promise.resolve();
  }

  async deleteMedication(id: string): Promise<void> {
    const index = GLOBAL_MEDICATIONS.findIndex((m) => m.id === id);
    if (index !== -1) {
      GLOBAL_MEDICATIONS.splice(index, 1);
    }
    return Promise.resolve();
  }

  async clearAll(): Promise<void> {
    // Modify the array in place to keep the reference if needed, or just splice
    GLOBAL_MEDICATIONS.splice(0, GLOBAL_MEDICATIONS.length);
    return Promise.resolve();
  }

  async markDoseTaken(
    medId: string,
    time: string,
    date: string,
  ): Promise<void> {
    GLOBAL_TAKEN_DOSES.push({ medId, time, date });

    // Update ReportRepository's storage to show the dot on calendar
    try {
      const STORAGE_KEY = "@focus:marked_dates";
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const dates = jsonValue != null ? JSON.parse(jsonValue) : {};

      // Mark the date
      dates[date] = {
        selected: true,
        marked: true,
        selectedColor: "#179A9B",
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
    } catch (e) {
      console.error("Error updating calendar mark from MockMedRepo", e);
    }

    return Promise.resolve();
  }

  async getTakenDoses(
    date: string,
  ): Promise<{ medId: string; time: string; date: string }[]> {
    return Promise.resolve(GLOBAL_TAKEN_DOSES.filter((d) => d.date === date));
  }

  async getAllTakenDoses(): Promise<
    { date: string; medId: string; time: string }[]
  > {
    return Promise.resolve(GLOBAL_TAKEN_DOSES);
  }

  async markDateAsTaken(date: string): Promise<void> {
    if (MOCK_MARKED_DATES) {
      MOCK_MARKED_DATES[date] = {
        selected: true,
        marked: true,
        dotColor: "#179A9B",
        selectedColor: "#179A9B",
      };
    }
    return Promise.resolve();
  }
}
