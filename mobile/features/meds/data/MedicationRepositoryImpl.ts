import { DatabaseService } from "@/data/local/DatabaseService";
import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";
import { Medication } from "@/features/meds/domain/entities/Medication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import api from "@/lib/api";

const CURRENT_USER_KEY = "currentUser";

export class MedicationRepositoryImpl implements MedicationRepository {
  private db = DatabaseService.getInstance();

  async syncCatalog(): Promise<void> {
    try {
      console.log("MedicationRepository: Syncing catalog...");
      const response = await api.get("/api/medicacoes");
      const meds = response.data;

      if (Array.isArray(meds)) {
        for (const med of meds) {
          // Upsert into SQLite
          // Check if exists
          const existing = await this.db.executeQuery(
            "SELECT id FROM medications WHERE id = ?",
            [med.id]
          );

          if (existing.length > 0) {
            await this.db.executeQuery(
              "UPDATE medications SET nome = ?, dosagem_padrao = ?, updated_at = ? WHERE id = ?",
              [med.nome, med.dosagemPadrao, Date.now(), med.id]
            );
          } else {
            await this.db.executeQuery(
              "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
              [med.id, med.nome, med.dosagemPadrao, Date.now(), Date.now()]
            );
          }
        }
        console.log(`MedicationRepository: Synced ${meds.length} medications.`);
      }
    } catch (e) {
      console.error(
        "MedicationRepository: Error syncing catalog (Offline?)",
        e
      );
    }
  }

  async saveMedication(medication: Medication): Promise<void> {
    try {
      const userId = await this._getUserId();
      const now = Date.now();

      // 1. Check/Create Medication in Local Catalog
      let medId = "";
      // Try to find by UUID first (if selecting from catalog)
      if (medication.id) {
        const check = await this.db.executeQuery(
          "SELECT id FROM medications WHERE id = ?",
          [medication.id]
        );
        if (check.length > 0) medId = medication.id;
      }

      // Fallback: Find by name or create new (Custom Med)
      if (!medId) {
        const existingMeds = await this.db.executeQuery(
          "SELECT id FROM medications WHERE nome = ? LIMIT 1",
          [medication.name]
        );

        if (existingMeds.length > 0) {
          medId = existingMeds[0].id;
        } else {
          medId = Crypto.randomUUID();
          await this.db.executeQuery(
            "INSERT INTO medications (id, nome, dosagem_padrao, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [medId, medication.name, medication.dosage || null, now, now]
          );
        }
      }

      // 2. Save/Update Treatment (Local SQLite)
      const existingTreatment = await this.db.executeQuery(
        "SELECT id FROM treatments WHERE id = ? OR (id_usuario = ? AND id_medicamento = ?)",
        [medication.id, userId, medId] // Check by ID or Composite Key
      );

      const daysJson = JSON.stringify(medication.days);
      const timesJson = JSON.stringify(medication.times);
      let treatmentId = medication.id;

      if (existingTreatment.length > 0) {
        treatmentId = existingTreatment[0].id;
        await this.db.executeQuery(
          `UPDATE treatments SET 
            id_medicamento = ?, dias = ?, horarios = ?, dose = ?, updated_at = ? 
           WHERE id = ?`,
          [
            medId,
            daysJson,
            timesJson,
            medication.dosage || null,
            now,
            treatmentId,
          ]
        );
      } else {
        treatmentId = treatmentId || Crypto.randomUUID();
        await this.db.executeQuery(
          `INSERT INTO treatments (id, id_usuario, id_medicamento, dias, horarios, dose, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            treatmentId,
            userId,
            medId,
            daysJson,
            timesJson,
            medication.dosage || null,
            now,
            now,
          ]
        );
      }

      // 3. Sync with Backend (Non-blocking)
      this._syncTreatmentToBackend(userId, medId, treatmentId, medication).catch(
        (err) => console.error("Background sync failed:", err)
      );
    } catch (e) {
      console.error("Error saving medication to SQLite", e);
      throw new Error("Failed to save medication");
    }
  }

  private async _syncTreatmentToBackend(
    userId: string,
    medId: string,
    treatmentId: string,
    med: Medication
  ) {
    if (userId === "guest") return;

    console.log("Syncing treatment to backend...");
    await api.post("/api/tratamentos", {
      id: treatmentId,
      usuarioId: userId,
      medicamentoId: medId,
      dose: med.dosage,
      dias: med.days,
      horarios: med.times,
    });
    console.log("Treatment synced successfully.");
  }

  private async _getUserId(): Promise<string> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) {
        console.log(
          "MedicationRepository: No user found in storage, defaulting to guest"
        );
        return "guest";
      }
      const user = JSON.parse(userJson);
      console.log(`MedicationRepository: Current user ID: ${user.id}`);
      return String(user.id);
    } catch (e) {
      console.error("Error getting user ID", e);
      return "guest";
    }
  }

  async getMedications(): Promise<Medication[]> {
    try {
      const userId = await this._getUserId();

      // JOIN entre Tratamentos e Medicamentos para montar o objeto completo
      const query = `
        SELECT 
          t.id, 
          m.nome as name, 
          t.dias, 
          t.horarios as times, 
          t.dose 
        FROM treatments t
        JOIN medications m ON t.id_medicamento = m.id
        WHERE t.id_usuario = ?
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
      console.error("Error getting medications from SQLite", e);
      return [];
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      // Deleta o tratamento. O registro em 'medications' (catálogo) permanece.
      await this.db.executeQuery("DELETE FROM treatments WHERE id = ?", [id]);
    } catch (e) {
      console.error("Error deleting medication from SQLite", e);
    }
  }

  async clearAll(): Promise<void> {
    try {
      const userId = await this._getUserId();
      await this.db.executeQuery("DELETE FROM treatments WHERE id_usuario = ?", [
        userId,
      ]);
    } catch (e) {
      console.error("Error clearing medications from SQLite", e);
    }
  }

  async markDoseTaken(
    medId: string,
    time: string, // Horário planejado (ex: "08:00")
    date: string, // Data planejada (ex: "2023-10-27")
    actualTakenTime?: string,
    medName?: string,
    mood?: number,
    anxiety?: boolean,
    focus?: number,
    notes?: string
  ): Promise<void> {
    try {
      const now = Date.now();
      const logId = Crypto.randomUUID();

      // Constrói ISO strings para o banco
      const scheduledIso = `${date}T${time}:00.000Z`;
      const takenIso = actualTakenTime
        ? `${date}T${actualTakenTime}:00.000Z`
        : new Date().toISOString();

      await this.db.executeQuery(
        `INSERT INTO dose_logs (id, id_tratamento, horario_plano, horario_tomado, humor, ansiedade, foco, notas, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          medId,
          scheduledIso,
          takenIso,
          mood ?? null,
          anxiety ? 1 : 0,
          focus ?? null,
          notes ?? null,
          now,
          now,
        ]
      );
    } catch (e) {
      console.error("Error marking dose taken in SQLite", e);
    }
  }

  async getTakenDoses(date: string): Promise<
    {
      medId: string;
      time: string;
      date: string;
      actualTakenTime?: string;
      medName?: string;
    }[]
  > {
    try {
      // Busca doses onde horario_plano começa com a data solicitada
      const query = `
        SELECT 
          d.id_tratamento as medId,
          d.horario_plano,
          d.horario_tomado
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
      console.error("Error getting taken doses from SQLite", e);
      return [];
    }
  }

  async getAllTakenDoses(): Promise<
    {
      date: string;
      medId: string;
      time: string;
      actualTakenTime?: string;
      medName?: string;
    }[]
  > {
    try {
      const userId = await this._getUserId();

      // JOIN complexo para pegar o nome do medicamento através do tratamento
      const query = `
        SELECT 
          d.horario_plano,
          d.horario_tomado,
          t.id as medId,
          m.nome as medName
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
      console.error("Error getting all taken doses from SQLite", e);
      return [];
    }
  }

  async markDateAsTaken(date: string): Promise<void> {
    // No SQLite, não precisamos salvar "datas marcadas" separadamente.
    // O calendário será gerado dinamicamente consultando a tabela dose_logs.
    // Método mantido vazio para compatibilidade com a interface.
  }

  async searchCatalog(
    query: string
  ): Promise<{ id: string; name: string; defaultDosage: string }[]> {
    try {
      const sql = `SELECT id, nome as name, dosagem_padrao as defaultDosage FROM medications WHERE nome LIKE ? LIMIT 20`;
      const rows = await this.db.executeQuery(sql, [`%${query}%`]);
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        defaultDosage: r.defaultDosage,
      }));
    } catch (e) {
      console.error("Error searching catalog", e);
      return [];
    }
  }
}
