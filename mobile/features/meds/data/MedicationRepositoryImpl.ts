import { Medication } from "@/features/meds/domain/entities/Medication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MedicationRepository } from "../domain/repositories/MedicationRepository";
import { DatabaseService } from "@/data/local/DatabaseService";
import * as Crypto from "expo-crypto"; // Para gerar UUIDs

// Keys
const CURRENT_USER_KEY = "@focus:currentUser";

export class MedicationRepositoryImpl implements MedicationRepository {
  private db = DatabaseService.getInstance();

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

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        days: JSON.parse(row.dias),
        times: JSON.parse(row.times),
        // dose: row.dose
      }));
    } catch (e) {
      console.error("Error getting medications from SQLite", e);
      return [];
    }
  }

  async saveMedication(medication: Medication): Promise<void> {
    try {
      const userId = await this._getUserId();
      const now = Date.now();

      // 1. Verificar se o medicamento (droga) já existe no catálogo, se não, criar.
      // Por simplificação, vamos buscar pelo nome.
      let medId = "";
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

      // 2. Salvar ou Atualizar o Tratamento (Vínculo User <-> Med)
      // Se o ID do tratamento já existe (edição), atualizamos.
      // Se não (novo), inserimos.

      // Verifica se é um update (se o ID já existe na tabela treatments)
      const existingTreatment = await this.db.executeQuery(
        "SELECT id FROM treatments WHERE id = ?",
        [medication.id]
      );

      const daysJson = JSON.stringify(medication.days);
      const timesJson = JSON.stringify(medication.times);

      if (existingTreatment.length > 0) {
        await this.db.executeQuery(
          `UPDATE treatments SET 
            id_medicamento = ?, dias = ?, horarios = ?, dose = ?, updated_at = ? 
           WHERE id = ?`,
          [medId, daysJson, timesJson, medication.dosage || null, now, medication.id]
        );
      } else {
        // Se o ID vier vazio ou for novo, gera um UUID
        const treatmentId = medication.id || Crypto.randomUUID();
        await this.db.executeQuery(
          `INSERT INTO treatments (id, id_usuario, id_medicamento, dias, horarios, dose, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [treatmentId, userId, medId, daysJson, timesJson, medication.dosage || null, now, now]
        );
      }
    } catch (e) {
      console.error("Error saving medication to SQLite", e);
      throw new Error("Failed to save medication");
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
      await this.db.executeQuery("DELETE FROM treatments WHERE id_usuario = ?", [userId]);
    } catch (e) {
      console.error("Error clearing medications from SQLite", e);
    }
  }

  async markDoseTaken(
    medId: string,
    time: string,  // Horário planejado (ex: "08:00")
    date: string,  // Data planejada (ex: "2023-10-27")
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
      const takenIso = actualTakenTime ? `${date}T${actualTakenTime}:00.000Z` : new Date().toISOString();

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
          now
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

      return rows.map(row => ({
        medId: row.medId,
        date: row.horario_plano.split('T')[0],
        time: row.horario_plano.split('T')[1].substring(0, 5),
        actualTakenTime: row.horario_tomado.split('T')[1].substring(0, 5)
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

      return rows.map(row => ({
        date: row.horario_plano.split('T')[0],
        time: row.horario_plano.split('T')[1].substring(0, 5),
        medId: row.medId,
        medName: row.medName,
        actualTakenTime: row.horario_tomado.split('T')[1].substring(0, 5)
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
}
