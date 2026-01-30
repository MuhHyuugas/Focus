import AsyncStorage from "@react-native-async-storage/async-storage";
import { Medication } from "../../domain/entities/Medication";
import { MedicationRepository } from "../../domain/repositories/MedicationRepository";

const STORAGE_KEY = "@focus:medications";

// classe que implementa a interface MedicationRepository
export class AsyncStorageMedicationRepository implements MedicationRepository {
  // função que pega os medicamentos
  async getMedications(): Promise<Medication[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Failed to loading medications", e);
      return [];
    }
  }

  // função que salva um medicamento
  async saveMedication(medication: Medication): Promise<void> {
    try {
      const medications = await this.getMedications();
      const newMedications = [...medications, medication];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMedications));
    } catch (e) {
      console.error("Failed to save medication", e);
    }
  }

  // função que deleta um medicamento
  async deleteMedication(id: string): Promise<void> {
    try {
      const medications = await this.getMedications();
      const newMedications = medications.filter((med) => med.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMedications));
    } catch (e) {
      console.error("Failed to delete medication", e);
    }
  }

  // função que limpa todos os medicamentos (memoria local)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear medications", e);
    }
  }
}
