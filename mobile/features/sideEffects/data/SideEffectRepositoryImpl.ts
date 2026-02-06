import { MOCK_SIDE_EFFECTS } from "@/data/mock/database";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "@focus:currentUser";

export class SideEffectRepositoryImpl implements SideEffectRepository {
  private async _getUserId(): Promise<string> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        throw new Error("User not authenticated");
      }
      const user = JSON.parse(userJson);
      return user.id;
    } catch (e) {
      console.error("Error getting user ID", e);
      throw new Error("Failed to get user ID");
    }
  }

  private async _getStorageKey(): Promise<string> {
    const userId = await this._getUserId();
    return `@focus:side_effects:${userId}`;
  }

  async getSideEffects(): Promise<SideEffect[]> {
    try {
      const key = await this._getStorageKey();
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        return JSON.parse(jsonValue);
      }

      // Seed default data
      await AsyncStorage.setItem(key, JSON.stringify(MOCK_SIDE_EFFECTS));
      return MOCK_SIDE_EFFECTS;
    } catch (e) {
      console.error("Error getting side effects", e);
      return [];
    }
  }

  async saveSideEffect(sideEffect: SideEffect): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getSideEffects();
      items.push(sideEffect);
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving side effect", e);
      throw new Error("Failed to save side effect");
    }
  }

  async updateSideEffect(updatedSideEffect: SideEffect): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getSideEffects();
      const index = items.findIndex((se) => se.id === updatedSideEffect.id);
      if (index !== -1) {
        items[index] = updatedSideEffect;
        await AsyncStorage.setItem(key, JSON.stringify(items));
      }
    } catch (e) {
      console.error("Error updating side effect", e);
    }
  }

  async deleteSideEffect(id: string): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getSideEffects();
      const newItems = items.filter((se) => se.id !== id);
      await AsyncStorage.setItem(key, JSON.stringify(newItems));
    } catch (e) {
      console.error("Error deleting side effect", e);
    }
  }

  async getSideEffectsByMedicationId(medId: string): Promise<SideEffect[]> {
    try {
      const items = await this.getSideEffects();
      return items.filter((se) => se.medicationId === medId);
    } catch (e) {
      return [];
    }
  }

  async deleteSideEffectsByMedicationId(medId: string): Promise<void> {
    try {
      const key = await this._getStorageKey();
      const items = await this.getSideEffects();
      const newItems = items.filter((se) => se.medicationId !== medId);
      await AsyncStorage.setItem(key, JSON.stringify(newItems));
    } catch (e) {
      console.error("Error deleting side effects by med id", e);
    }
  }
}
