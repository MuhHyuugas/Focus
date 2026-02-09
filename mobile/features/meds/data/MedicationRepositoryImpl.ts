import { DatabaseService } from "@/data/local/DatabaseService";
import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { Medication } from "@/features/meds/domain/entities/Medication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import api from "@/lib/api";

const CURRENT_USER_KEY = "@focus:currentUser";

export class MedicationRepositoryImpl implements MedicationRepository {
  private db = DatabaseService.getInstance();

  async syncCatalog(): Promise<void> {
    try {
      console.log("MedicationRepository: Syncing catalog...");
      const response = await api.get("/api/medicacoes");
      const meds = response.data;

      if (Array.isArray(meds)) {
        for (const med of meds) {
          const existing = await this.db.executeQuery(
            "SELECT id FROM medications WHERE id = ?",
            [med.id],
          );

          if (existing.length > 0) {
            await this.db.executeQuery(
              "UPDATE medications SET nome = ?, dosagem_padrao = ?, updated_at = ? WHERE id = ?",
              [med.nome, med.dosagemPadrao, Date.now(), med.id],
            );
          } else {
            await this.db.executeQuery(
              "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              [med.id, med.nome, med.dosagemPadrao, Date.now(), Date.now()],
            );
          }
        }
        console.log(`MedicationRepository: Synced ${meds.length} medications.`);
      }
    } catch (e) {
      console.error("MedicationRepository: Error syncing catalog", e);
    }
  }

  async syncTreatments(): Promise<void> {
    try {
      const userId = await this._getUserId();
      console.log(
        `MedicationRepository: Syncing treatments for user ${userId}...`,
      );
      const response = await api.get(`/api/tratamentos/${userId}`);
      const treatments = response.data;

      if (Array.isArray(treatments)) {
        for (const t of treatments) {
          const now = Date.now();

          // 1. Ensure Medication exists in local catalog
          const medCheck = await this.db.executeQuery(
            "SELECT id FROM medications WHERE id = ?",
            [t.medicacaoId],
          );

          if (medCheck.length === 0) {
            await this.db.executeQuery(
              "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              [t.medicacaoId, t.nomeMedicamento, t.dose, now, now],
            );
          }

          // 2. Upsert Treatment with Deduplication Reconcilliation
          // Check by ID first (Standard)
          const treatCheck = await this.db.executeQuery(
            "SELECT id FROM treatments WHERE id = ?",
            [t.id],
          );

          if (treatCheck.length > 0) {
            await this.db.executeQuery(
              `UPDATE treatments SET 
                id_usuario = ?, id_medicamento = ?, dose = ?, dias = ?, horarios = ?, status = ?, updated_at = ? 
               WHERE id = ?`,
              [
                userId,
                t.medicacaoId,
                t.dose,
                t.dias,
                t.horarios,
                t.status || "ativo",
                now,
                t.id,
              ],
            );
          } else {
            // Check if we have a "Ghost" duplicate (Same Med, Different ID)
            const ghostCheck = await this.db.executeQuery(
              "SELECT id FROM treatments WHERE id_usuario = ? AND id_medicamento = ?",
              [userId, t.medicacaoId],
            );

            if (ghostCheck.length > 0) {
              console.log(
                `MedicationRepository: Found ghost duplicate for ${t.nomeMedicamento}. Reconciling...`,
              );
              // Delete the local one with the wrong ID and adopt the Server result
              await this.db.executeQuery(
                "DELETE FROM treatments WHERE id = ?",
                [ghostCheck[0].id],
              );
            }

            await this.db.executeQuery(
              `INSERT INTO treatments (id, id_usuario, id_medicamento, dose, dias, horarios, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                t.id,
                userId,
                t.medicacaoId,
                t.dose,
                t.dias,
                t.horarios,
                t.status || "ativo",
                now,
                now,
              ],
            );
          }
        }
        console.log(
          `MedicationRepository: Synced ${treatments.length} treatments.`,
        );
      }
    } catch (e) {
      console.error("MedicationRepository: Error syncing treatments", e);
    }
  }

  async syncDoseLogs(): Promise<void> {
    try {
      const userId = await this._getUserId();
      console.log(
        `MedicationRepository: Syncing DoseLogs for user ${userId}...`,
      );
      const response = await api.get(`/api/DoseLogs/usuario/${userId}`);
      const logs = response.data;

      if (Array.isArray(logs)) {
        for (const log of logs) {
          const now = Date.now();
          // Upsert into local dose_logs
          const check = await this.db.executeQuery(
            "SELECT id FROM dose_logs WHERE id = ?",
            [log.id],
          );

          if (check.length === 0) {
            await this.db.executeQuery(
              `INSERT INTO dose_logs (id, id_tratamento, horario_plano, horario_tomado, notas, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                log.id,
                log.tratamentoId,
                log.horarioPlano,
                log.horarioTomado,
                log.notas,
                now,
                now,
              ],
            );
          } else {
            // Optional: Update if needed (though logs are usually immutable)
            await this.db.executeQuery(
              `UPDATE dose_logs SET 
                notas = ?, updated_at = ? 
               WHERE id = ?`,
              [log.notas, now, log.id],
            );
          }
        }
        console.log(`MedicationRepository: Synced ${logs.length} dose logs.`);
      }
    } catch (e) {
      console.error("MedicationRepository: Error syncing dose logs", e);
    }
  }

  async getMedications(): Promise<Medication[]> {
    try {
      const userId = await this._getUserId();
      const query = `
        SELECT 
          t.id, 
          m.nome as name, 
          t.dias, 
          t.horarios as times, 
          t.dose 
        FROM treatments t
        JOIN medications m ON t.id_medicamento = m.id
        WHERE t.id_usuario = ? AND t.status = 'ativo'
      `;

      const rows = await this.db.executeQuery(query, [userId]);

      return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        days: JSON.parse(row.dias),
        times: JSON.parse(row.times),
        dosage: row.dose,
      }));
    } catch (e) {
      console.error("MedicationRepository: Error getting medications", e);
      return [];
    }
  }

  async saveMedication(medication: Medication): Promise<void> {
    try {
      const userId = await this._getUserId();
      const now = Date.now();

      // 1. Get currently active treatments to sync deactivation to backend
      const activeTreatments = await this.db.executeQuery(
        "SELECT id, id_medicamento as medId, dose, dias, horarios FROM treatments WHERE id_usuario = ? AND status = 'ativo'",
        [userId],
      );

      // 2. Deactivate them locally
      await this.db.executeQuery(
        "UPDATE treatments SET status = 'inativo', updated_at = ? WHERE id_usuario = ? AND status = 'ativo'",
        [now, userId],
      );

      // 3. Sync deactivation to backend
      for (const t of activeTreatments) {
        // Need to fetch med name first if not in treatment table (it is joined usually)
        // But for sync we need the structure.
        // Let's get the medication details to be safe
        const medDetails = await this.db.executeQuery(
          "SELECT nome FROM medications WHERE id = ?",
          [t.medId],
        );
        const medName =
          medDetails.length > 0 ? medDetails[0].nome : "Desconhecido";

        await this._syncTreatmentToBackend(userId, t.medId, t.id, {
          id: t.medId,
          name: medName,
          dosage: t.dose,
          days: JSON.parse(t.dias),
          times: JSON.parse(t.horarios),
          status: "inativo", // Force inactive status
        }).catch((e) =>
          console.error(`Failed to sync deactivation for ${t.id}`, e),
        );
      }

      let medId = "";
      if (medication.id) {
        const check = await this.db.executeQuery(
          "SELECT id FROM medications WHERE id = ?",
          [medication.id],
        );
        if (check.length > 0) medId = medication.id;
      }

      if (!medId) {
        const existingMeds = await this.db.executeQuery(
          "SELECT id FROM medications WHERE nome = ? LIMIT 1",
          [medication.name],
        );

        if (existingMeds.length > 0) {
          medId = existingMeds[0].id;
        } else {
          medId = Crypto.randomUUID();
          await this.db.executeQuery(
            "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [medId, medication.name, medication.dosage || null, now, now],
          );
        }
      }

      const existingTreatment = await this.db.executeQuery(
        "SELECT id FROM treatments WHERE id = ? OR (id_usuario = ? AND id_medicamento = ?)",
        [medication.id, userId, medId],
      );

      const daysJson = JSON.stringify(medication.days);
      const timesJson = JSON.stringify(medication.times);
      let treatmentId = medication.id;

      if (existingTreatment.length > 0) {
        treatmentId = existingTreatment[0].id;
        await this.db.executeQuery(
          `UPDATE treatments SET 
            id_medicamento = ?, dias = ?, horarios = ?, dose = ?, status = 'ativo', updated_at = ? 
           WHERE id = ?`,
          [
            medId,
            daysJson,
            timesJson,
            medication.dosage || null,
            now,
            treatmentId,
          ],
        );
      } else {
        treatmentId = treatmentId || Crypto.randomUUID();
        await this.db.executeQuery(
          `INSERT INTO treatments (id, id_usuario, id_medicamento, dias, horarios, dose, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?, ?)`,
          [
            treatmentId,
            userId,
            medId,
            daysJson,
            timesJson,
            medication.dosage || null,
            now,
            now,
          ],
        );
      }

      this._syncTreatmentToBackend(
        userId,
        medId,
        treatmentId,
        medication,
      ).catch((err) => console.error("Background sync failed:", err));
    } catch (e) {
      console.error("MedicationRepository: Error saving medication", e);
      throw new Error("Failed to save medication");
    }
  }

  private async _syncTreatmentToBackend(
    userId: string,
    medId: string,
    treatmentId: string,
    med: Medication,
  ) {
    await api.post("/api/tratamentos", {
      UsuarioId: userId,
      NomeMedicamento: med.name,
      Dosagem: med.dosage,
      Dias: JSON.stringify(med.days),
      Horarios: JSON.stringify(med.times),
      Status: med.status || "ativo",
      Id: treatmentId, // Send local ID to backend
    });
  }

  private async _syncDoseLogToBackend(
    id: string,
    tratamentoId: string,
    horarioPlano: string,
    horarioTomado: string,
    notas?: string,
  ) {
    console.log(`MedicationRepository: Syncing DoseLog ${id} to backend...`);
    await api.post("/api/DoseLogs", {
      Id: id,
      TratamentoId: tratamentoId,
      HorarioPlano: horarioPlano,
      HorarioTomado: horarioTomado,
      Notas: notas ?? null,
    });
  }

  private async _getUserId(): Promise<string> {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) throw new Error("Usuário não autenticado");
    const user = JSON.parse(userJson);
    return String(user.id);
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      // 1. Delete Side Effects
      await this.db.executeQuery(
        "DELETE FROM side_effects WHERE id_tratamento = ?",
        [id],
      );

      // 2. Delete Dose Logs
      await this.db.executeQuery(
        "DELETE FROM dose_logs WHERE id_tratamento = ?",
        [id],
      );

      // 3. Delete Treatment
      await this.db.executeQuery("DELETE FROM treatments WHERE id = ?", [id]);
    } catch (e) {
      console.error("MedicationRepository: Error deleting medication", e);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const userId = await this._getUserId();
      // 1. Get user treatments to delete dependent logs
      const treatments = await this.db.executeQuery(
        "SELECT id FROM treatments WHERE id_usuario = ?",
        [userId],
      );

      if (treatments.length > 0) {
        const ids = treatments.map((t: any) => t.id);
        const placeholders = ids.map(() => "?").join(",");

        // 2. Delete Side Effects
        await this.db.executeQuery(
          `DELETE FROM side_effects WHERE id_tratamento IN (${placeholders})`,
          ids,
        );

        // 3. Delete Dose Logs
        await this.db.executeQuery(
          `DELETE FROM dose_logs WHERE id_tratamento IN (${placeholders})`,
          ids,
        );

        // 4. Delete Treatments
        await this.db.executeQuery(
          `DELETE FROM treatments WHERE id IN (${placeholders})`,
          ids,
        );
      }
    } catch (e) {
      console.error("MedicationRepository: Error clearing medications", e);
    }
  }

  async markDoseTaken(
    medId: string,
    time: string,
    date: string,
    actualTakenTime?: string,
    medName?: string,
  ): Promise<void> {
    try {
      const now = Date.now();
      const logId = Crypto.randomUUID();
      const scheduledIso = `${date}T${time}:00.000Z`;
      const takenIso = actualTakenTime
        ? `${date}T${actualTakenTime}:00.000Z`
        : new Date().toISOString();

      await this.db.executeQuery(
        `INSERT INTO dose_logs (id, id_tratamento, horario_plano, horario_tomado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [logId, medId, scheduledIso, takenIso, now, now],
      );

      // 4. Push to Backend (Non-blocking)
      this._syncDoseLogToBackend(logId, medId, scheduledIso, takenIso).catch(
        (err) => console.error("Background DoseLog sync failed:", err),
      );
    } catch (e) {
      console.error("MedicationRepository: Error marking dose taken", e);
    }
  }

  async getTakenDoses(date: string): Promise<any[]> {
    try {
      const query = `
        SELECT d.id_tratamento as medId, d.horario_plano, d.horario_tomado
        FROM dose_logs d
        WHERE d.horario_plano LIKE ?
      `;
      const rows = await this.db.executeQuery(query, [`${date}%`]);
      return rows.map((row: any) => ({
        medId: row.medId,
        date: row.horario_plano.split("T")[0],
        time: row.horario_plano.split("T")[1].substring(0, 5),
        actualTakenTime: row.horario_tomado.split("T")[1].substring(0, 5),
      }));
    } catch (e) {
      console.error("MedicationRepository: Error getting taken doses", e);
      return [];
    }
  }

  async getAllTakenDoses(): Promise<any[]> {
    try {
      const userId = await this._getUserId();
      const query = `
        SELECT d.horario_plano, d.horario_tomado, t.id as medId, m.nome as medName
        FROM dose_logs d
        JOIN treatments t ON d.id_tratamento = t.id
        JOIN medications m ON t.id_medicamento = m.id
        WHERE t.id_usuario = ?
      `;
      const rows = await this.db.executeQuery(query, [userId]);
      return rows.map((row: any) => ({
        date: row.horario_plano.split("T")[0],
        time: row.horario_plano.split("T")[1].substring(0, 5),
        medId: row.medId,
        medName: row.medName,
        actualTakenTime: row.horario_tomado.split("T")[1].substring(0, 5),
      }));
    } catch (e) {
      console.error("MedicationRepository: Error getting all taken doses", e);
      return [];
    }
  }

  async markDateAsTaken(date: string): Promise<void> {}

  async searchCatalog(query: string): Promise<any[]> {
    try {
      const response = await api.get("/api/medicacoes");
      const allMeds = response.data;
      return allMeds
        .filter((m: any) => m.nome.toLowerCase().includes(query.toLowerCase()))
        .map((m: any) => ({
          id: m.id,
          name: m.nome,
          defaultDosage: m.dosagemPadrao,
        }));
    } catch (e) {
      const sql = `SELECT id, nome as name, dosagem_padrao as defaultDosage FROM medications WHERE nome LIKE ? LIMIT 20`;
      const rows = await this.db.executeQuery(sql, [`%${query}%`]);
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        defaultDosage: r.defaultDosage,
      }));
    }
  }
}
