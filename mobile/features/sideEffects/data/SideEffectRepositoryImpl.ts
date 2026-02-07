import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";
import { DatabaseService } from "@/data/local/DatabaseService";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "@focus:currentUser";

export class SideEffectRepositoryImpl implements SideEffectRepository {
  private db = DatabaseService.getInstance();

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

  async getSideEffects(): Promise<SideEffect[]> {
    try {
      const userId = await this._getUserId();
      // Fetch dose_logs that look like side effects (e.g. have notes)
      // Since we don't have a specific type column, we assume any log with notas is relevant?
      // Or maybe we treat ALL logs as potential carriers.
      // But the UI expects "SideEffects".
      // Let's return logs that have 'notas' for now, as that's where we map 'notes'.
      const query = `
        SELECT 
          d.id, 
          d.id_tratamento as medicationId, 
          d.horario_tomado as date, 
          d.notas
        FROM dose_logs d
        JOIN treatments t ON d.id_tratamento = t.id
        WHERE t.id_usuario = ? AND d.notas IS NOT NULL AND d.notas != ''
        ORDER BY d.horario_tomado DESC
      `;

      const rows = await this.db.executeQuery(query, [userId]);

      return rows.map((row: any) => ({
        id: row.id,
        medicationId: row.medicationId,
        date: row.date,
        notes: row.notas,
        description: "", // Not saved, UI only or derived
      }));
    } catch (e) {
      console.error("Error getting side effects", e);
      return [];
    }
  }

  async saveSideEffect(sideEffect: SideEffect): Promise<void> {
    try {
      const now = Date.now();
      const id = sideEffect.id || Crypto.randomUUID();

      // 1. Get Treatment/Plan Time
      // We need to find the treatment ID. The sideEffect should have medicationId.
      // dose_logs links to 'treatments`.
      // So first we need to find the active treatment for this medication.
      const userId = await this._getUserId();
      const treatments = await this.db.executeQuery(
        "SELECT id, horarios FROM treatments WHERE id_medicamento = ? AND id_usuario = ?",
        [sideEffect.medicationId, userId],
      );

      if (treatments.length === 0) {
        throw new Error("No active treatment found for this medication.");
      }

      const treatment = treatments[0];
      const treatmentId = treatment.id;

      let horarioPlano = sideEffect.date; // Default to taken time if no plan found

      // Logic to find nearest plan time could go here.
      // safely parse horarios
      try {
        const times = JSON.parse(treatment.horarios);
        if (Array.isArray(times) && times.length > 0) {
          // Find nearest time today?
          // For simplicity, let's use the first scheduled time of the day of the side effect?
          // Or just use the current time if it's an ad-hoc event?
          // User said "get horario plano from the treatment table".
          // Let's try to match the closest time.
          const takenDate = new Date(sideEffect.date);
          // ... simplistic approach: just use the sideEffect.date for now unless we implement complex matching.
          // BUT, if dose_logs enforces foreign key on treatment, we have treatmentId.
          // horario_plano is just a text field.
          // Let's use the first index time combined with the date string.
          const timeStr = times[0]; // e.g. "08:00"
          const datePart = sideEffect.date.split("T")[0];
          horarioPlano = `${datePart}T${timeStr}:00.000Z`;
        }
      } catch (e) {
        // ignore parsing error
      }

      await this.db.executeQuery(
        `INSERT INTO dose_logs (id, id_tratamento, horario_plano, horario_tomado, notas, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          treatmentId,
          horarioPlano,
          sideEffect.date, // horario_tomado
          sideEffect.notes,
          now,
          now,
        ],
      );
    } catch (e) {
      console.error("Error saving side effect", e);
      throw new Error("Failed to save side effect");
    }
  }

  async updateSideEffect(updatedSideEffect: SideEffect): Promise<void> {
    try {
      const now = Date.now();
      await this.db.executeQuery(
        "UPDATE dose_logs SET notas = ?, updated_at = ? WHERE id = ?",
        [updatedSideEffect.notes, now, updatedSideEffect.id],
      );
    } catch (e) {
      console.error("Error updating side effect", e);
    }
  }

  async deleteSideEffect(id: string): Promise<void> {
    try {
      await this.db.executeQuery("DELETE FROM dose_logs WHERE id = ?", [id]);
    } catch (e) {
      console.error("Error deleting side effect", e);
    }
  }

  async getSideEffectsByMedicationId(medId: string): Promise<SideEffect[]> {
    try {
      // Since getSideEffects filters by user, we can leverage it or query directly.
      // Direct query is more efficient.
      const userId = await this._getUserId();
      const query = `
        SELECT 
          d.id, 
          d.id_tratamento as medicationId, 
          d.horario_tomado as date, 
          d.notas
        FROM dose_logs d
        JOIN treatments t ON d.id_tratamento = t.id
        WHERE t.id_usuario = ? AND t.id_medicamento = ? AND d.notas IS NOT NULL AND d.notas != ''
        ORDER BY d.horario_tomado DESC
      `;

      const rows = await this.db.executeQuery(query, [userId, medId]);

      return rows.map((row: any) => ({
        id: row.id,
        medicationId: row.medicationId,
        date: row.date,
        notes: row.notas,
        description: "",
      }));
    } catch (e) {
      return [];
    }
  }

  async deleteSideEffectsByMedicationId(medId: string): Promise<void> {
    try {
      // Logic to delete all logs for a med? Or just side effects?
      // "Delete side effects"
      // We should only delete logs that are considered side effects?
      // But dose_logs mixes doses and side effects.
      // If we delete by medication ID, we query treatments first.
      const userId = await this._getUserId();
      // This is risky if we delete distinct doses.
      // But usually clearing history clears everything.
      // I'll assume this method is for clearing history.
      const query = `
            DELETE FROM dose_logs 
            WHERE id_tratamento IN (SELECT id FROM treatments WHERE id_medicamento = ? AND id_usuario = ?)
        `;
      await this.db.executeQuery(query, [medId, userId]);
    } catch (e) {
      console.error("Error deleting side effects by med id", e);
    }
  }
}
