import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SideEffectRepository } from "@/features/sideEffects/domain/repositories/SideEffectRepository";
import { DatabaseService } from "@/data/local/DatabaseService";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/api";

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
      const query = `
        SELECT 
          s.id, 
          s.id_tratamento as medicationId, 
          s.tipo_id as typeId,
          s.descricao as description,
          s.data as date, 
          s.humor,
          s.ansiedade,
          s.foco,
          s.notas
        FROM side_effects s
        JOIN treatments t ON s.id_tratamento = t.id
        WHERE t.id_usuario = ?
        ORDER BY s.data DESC
      `;

      const rows = await this.db.executeQuery(query, [userId]);

      return rows.map((row: any) => ({
        id: row.id,
        medicationId: row.medicationId,
        typeId: row.typeId,
        description: row.description,
        date: row.date,
        notes: row.notas,
        mood: row.humor,
        anxiety: row.ansiedade === 1,
        focus: row.foco,
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
      const userId = await this._getUserId();

      console.log(`SideEffectRepository: Saving Effect. MedID/TreatID: ${sideEffect.medicationId}, Type: ${sideEffect.typeId}, Mood: ${sideEffect.mood}, Focus: ${sideEffect.focus}`);

      // 1. Resolve Treatment ID
      let treatmentId = sideEffect.medicationId;
      const treatById = await this.db.executeQuery(
        "SELECT id FROM treatments WHERE id = ? AND id_usuario = ?",
        [sideEffect.medicationId, userId],
      );

      if (treatById.length === 0) {
        const treatByMed = await this.db.executeQuery(
          "SELECT id FROM treatments WHERE id_medicamento = ? AND id_usuario = ?",
          [sideEffect.medicationId, userId],
        );

        if (treatByMed.length === 0) {
          throw new Error("No active treatment found for this record.");
        }
        treatmentId = treatByMed[0].id;
      }

      console.log(`SideEffectRepository: Resolved Treatment ID: ${treatmentId}`);

      // 2. Insert into local SQLite
      const moodVal = sideEffect.mood !== undefined && sideEffect.mood !== null ? Number(sideEffect.mood) : null;
      const focusVal = sideEffect.focus !== undefined && sideEffect.focus !== null ? Number(sideEffect.focus) : null;
      const anxietyVal = sideEffect.anxiety ? 1 : 0;

      await this.db.executeQuery(
        `INSERT INTO side_effects (id, id_tratamento, tipo_id, descricao, data, humor, ansiedade, foco, notas, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          treatmentId,
          sideEffect.typeId,
          sideEffect.description,
          sideEffect.date,
          moodVal,
          anxietyVal,
          focusVal,
          sideEffect.notes,
          now,
          now,
        ],
      );

      // 3. Sync to Backend (Non-blocking)
      this._syncSideEffectToBackend(id, treatmentId, {
        ...sideEffect,
        mood: moodVal ?? undefined,
        focus: focusVal ?? undefined
      }).catch((err) =>
        console.error("Cloud sync for side effect failed:", err),
      );
    } catch (e) {
      console.error("Error saving side effect", e);
      throw new Error("Failed to save side effect");
    }
  }

  async updateSideEffect(updatedSideEffect: SideEffect): Promise<void> {
    try {
      const now = Date.now();
      const moodVal = updatedSideEffect.mood !== undefined && updatedSideEffect.mood !== null ? Number(updatedSideEffect.mood) : null;
      const focusVal = updatedSideEffect.focus !== undefined && updatedSideEffect.focus !== null ? Number(updatedSideEffect.focus) : null;

      await this.db.executeQuery(
        "UPDATE side_effects SET notas = ?, humor = ?, ansiedade = ?, foco = ?, updated_at = ? WHERE id = ?",
        [
          updatedSideEffect.notes,
          moodVal,
          updatedSideEffect.anxiety ? 1 : 0,
          focusVal,
          now,
          updatedSideEffect.id,
        ],
      );
    } catch (e) {
      console.error("Error updating side effect", e);
    }
  }

  async deleteSideEffect(id: string): Promise<void> {
    try {
      await this.db.executeQuery("DELETE FROM side_effects WHERE id = ?", [id]);
    } catch (e) {
      console.error("Error deleting side effect", e);
    }
  }

  async getSideEffectsByMedicationId(medId: string): Promise<SideEffect[]> {
    try {
      const userId = await this._getUserId();
      const query = `
        SELECT 
          s.id, 
          s.id_tratamento as medicationId, 
          s.tipo_id as typeId,
          s.descricao as description,
          s.data as date, 
          s.humor,
          s.ansiedade,
          s.foco,
          s.notas
        FROM side_effects s
        JOIN treatments t ON s.id_tratamento = t.id
        WHERE t.id_usuario = ? AND t.id_medicamento = ?
        ORDER BY s.data DESC
      `;

      const rows = await this.db.executeQuery(query, [userId, medId]);

      return rows.map((row: any) => ({
        id: row.id,
        medicationId: row.medicationId,
        typeId: row.typeId,
        description: row.description,
        date: row.date,
        notes: row.notas,
        mood: row.humor,
        anxiety: row.ansiedade === 1,
        focus: row.foco,
      }));
    } catch (e) {
      return [];
    }
  }

  async deleteSideEffectsByMedicationId(medId: string): Promise<void> {
    try {
      const userId = await this._getUserId();
      const query = `
            DELETE FROM side_effects 
            WHERE id_tratamento IN (SELECT id FROM treatments WHERE id_medicamento = ? AND id_usuario = ?)
        `;
      await this.db.executeQuery(query, [medId, userId]);
    } catch (e) {
      console.error("Error deleting side effects by med id", e);
    }
  }

  async syncData(): Promise<void> {
    try {
      const userId = await this._getUserId();
      console.log(`SideEffectRepository: Syncing symptoms for user ${userId}...`);

      const response = await api.get(`/api/SideEffects/usuario/${userId}`);
      const remoteEffects = response.data;

      if (Array.isArray(remoteEffects)) {
        const now = Date.now();

        for (const remote of remoteEffects) {
          // 1. Check if record exists by ID
          const existing = await this.db.executeQuery(
            "SELECT id FROM side_effects WHERE id = ?",
            [remote.id],
          );

          if (existing.length > 0) {
            // Update existing
            await this.db.executeQuery(
              `UPDATE side_effects SET 
                id_tratamento = ?, tipo_id = ?, descricao = ?, data = ?, humor = ?, ansiedade = ?, foco = ?, notas = ?, updated_at = ? 
               WHERE id = ?`,
              [
                remote.tratamentoId,
                remote.tipoId,
                remote.descricao,
                remote.data,
                remote.humor,
                remote.ansiedade ? 1 : 0,
                remote.foco,
                remote.notas,
                now,
                remote.id,
              ],
            );
          } else {
            // 2. Deduplication check by Date and Type (To avoid "Ghost" duplicates from different client IDs)
            const duplicate = await this.db.executeQuery(
              "SELECT id FROM side_effects WHERE id_tratamento = ? AND data = ? AND tipo_id = ?",
              [remote.tratamentoId, remote.data, remote.tipoId],
            );

            if (duplicate.length > 0) {
              console.log(
                `SideEffectRepository: Found duplicate for ${remote.tipoId} at ${remote.data}. Reconciling...`,
              );
              // Delete the local one with the wrong ID and adopt the Server result
              await this.db.executeQuery(
                "DELETE FROM side_effects WHERE id = ?",
                [duplicate[0].id],
              );
            }

            // Insert new
            await this.db.executeQuery(
              `INSERT INTO side_effects (id, id_tratamento, tipo_id, descricao, data, humor, ansiedade, foco, notas, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                remote.id,
                remote.tratamentoId,
                remote.tipoId,
                remote.descricao,
                remote.data,
                remote.humor,
                remote.ansiedade ? 1 : 0,
                remote.foco,
                remote.notas,
                now,
                now,
              ],
            );
          }
        }
        console.log(
          `SideEffectRepository: Synced ${remoteEffects.length} symptoms.`,
        );
      }
    } catch (e) {
      console.error("SideEffectRepository: Error syncing symptoms", e);
    }
  }

  private async _syncSideEffectToBackend(
    id: string,
    tratamentoId: string,
    sideEffect: SideEffect,
  ) {
    // Using camelCase and PascalCase payload to ensure compatibility with backend binding
    const payload = {
      Id: id,
      TratamentoId: tratamentoId,
      TipoId: sideEffect.typeId,
      Descricao: sideEffect.description,
      Data: sideEffect.date,
      Humor: sideEffect.mood !== undefined && sideEffect.mood !== null ? Number(sideEffect.mood) : null,
      Ansiedade: !!sideEffect.anxiety,
      Foco: sideEffect.focus !== undefined && sideEffect.focus !== null ? Number(sideEffect.focus) : null,
      Notas: sideEffect.notes,
    };

    console.log("SideEffectRepository: Syncing to backend with payload:", JSON.stringify(payload));
    await api.post("/api/SideEffects", payload);
  }
}
