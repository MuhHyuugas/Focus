import { MOCK_MEDICATIONS } from "@/data/mock/database";
import { Medication } from "@/features/meds/domain/entities/Medication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MedicationRepository } from "../domain/repositories/MedicationRepository";

// Keys
const CURRENT_USER_KEY = "@focus:currentUser";
const REPORT_MARKED_DATES_KEY = "@focus:marked_dates";

export class MedicationRepositoryImpl implements MedicationRepository {
  private async _getUserId(): Promise<string> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        console.log(
          "MedicationRepository: No user found in storage, defaulting to guest",
        );
        return "guest";
      }
      const user = JSON.parse(userJson);
      console.log(`MedicationRepository: Current user ID: ${user.id}`);
      return user.id;
    } catch (e) {
      console.error("Error getting user ID", e);
      return "guest";
    }
  }

  private async _getMedicationsKey(): Promise<string> {
    const userId = await this._getUserId();
    return `@focus:medications:${userId}`;
  }

  private async _getTakenDosesKey(): Promise<string> {
    const userId = await this._getUserId();
    return `@focus:taken_doses:${userId}`;
  }

  async getMedications(): Promise<Medication[]> {
    try {
      const key = await this._getMedicationsKey();
      console.log(`MedicationRepository: Getting medications for key: ${key}`);
      const jsonValue = await AsyncStorage.getItem(key);
      console.log(
        `MedicationRepository: Found ${jsonValue ? "data" : "no data"} for key ${key}`,
      );

      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }

      // No seeding - Start empty
      return [];
    } catch (e) {
      console.error("Error getting medications", e);
      return [];
    }
  }

  async saveMedication(medication: Medication): Promise<void> {
    try {
      const key = await this._getMedicationsKey();
      console.log(`MedicationRepository: Saving medication to key: ${key}`);
      const meds = await this.getMedications();

      const index = meds.findIndex((m) => m.id === medication.id);
      if (index !== -1) {
        meds[index] = medication;
      } else {
        meds.push(medication);
      }

      await AsyncStorage.setItem(key, JSON.stringify(meds));
      console.log("MedicationRepository: Save successful");
    } catch (e) {
      console.error("Error saving medication", e);
      throw new Error("Failed to save medication");
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      const key = await this._getMedicationsKey();
      const meds = await this.getMedications();
      const newMeds = meds.filter((m) => m.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(newMeds));
    } catch (e) {
      console.error("Error deleting medication", e);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const key = await this._getMedicationsKey();
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Error clearing medications", e);
    }
  }

  async markDoseTaken(
    medId: string,
    time: string,
    date: string,
  ): Promise<void> {
    try {
      const key = await this._getTakenDosesKey();
      const existingJson = await AsyncStorage.getItem(key);
      const doses = existingJson ? JSON.parse(existingJson) : [];

      doses.push({ medId, time, date });

      await AsyncStorage.setItem(key, JSON.stringify(doses));

      await this._updateCalendarMark(date);
    } catch (e) {
      console.error("Error marking dose taken", e);
    }
  }

  async getTakenDoses(
    date: string,
  ): Promise<{ medId: string; time: string; date: string }[]> {
    try {
      const key = await this._getTakenDosesKey();
      const jsonValue = await AsyncStorage.getItem(key);
      const doses = jsonValue ? JSON.parse(jsonValue) : [];
      return doses.filter((d: any) => d.date === date);
    } catch (e) {
      console.error("Error getting taken doses", e);
      return [];
    }
  }

  async getAllTakenDoses(): Promise<
    { date: string; medId: string; time: string }[]
  > {
    try {
      const key = await this._getTakenDosesKey();
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Error getting all taken doses", e);
      return [];
    }
  }

  async markDateAsTaken(date: string): Promise<void> {
    await this._updateCalendarMark(date);
  }

  private async _updateCalendarMark(date: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(REPORT_MARKED_DATES_KEY);
      const dates = jsonValue != null ? JSON.parse(jsonValue) : {};

      dates[date] = {
        selected: true,
        marked: true,
        selectedColor: "#179A9B",
      };

      await AsyncStorage.setItem(
        REPORT_MARKED_DATES_KEY,
        JSON.stringify(dates),
      );
    } catch (e) {
      console.error("Error updating calendar", e);
    }
  }
}
