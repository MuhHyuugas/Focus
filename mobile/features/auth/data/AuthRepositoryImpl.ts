import { RegisterData } from "../domain/entities/RegisterData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/entities/User";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import api from "@/lib/api";
import { DatabaseService } from "@/data/local/DatabaseService";

const USER_STORAGE_KEY = "@focus:key_users";
const AUTH_STORAGE_KEY = "@focus:isAuthenticated";
const CURRENT_USER_KEY = "@focus:currentUser";

//classe que implementa o repositorio de autenticação
export class AuthRepositoryImpl implements AuthRepository {
  private db = DatabaseService.getInstance();
  async register(data: RegisterData): Promise<void> {

    // verifica se o usuario ja existe (SQLite)
    const existing = await this.db.executeQuery(
      "SELECT id FROM users WHERE email = ? OR telefone = ? LIMIT 1",
      [data.email, data.phone]
    );

    if (existing.length > 0) {
      throw new Error("Usuário já cadastrado.");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      password: data.password,
      profilePicture: null,
    };

    const now = Date.now();

    // 1. Save Locally FIRST (Offline-First) - INSERT into SQLite
    await this.db.executeQuery(
      `INSERT INTO users (id, nome, email, senha_hash, telefone, data_nascimento, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.phone,
        newUser.birthDate,
        null, // avatar
        now,
        now
      ]
    );

    // 2. Try Sync with Backend (Non-blocking)
    try {
      const [day, month, year] = data.birthDate.split("/");
      const birthDateForBackend = `${year}-${month}-${day}`;

      await api.post("/api/Usuarios", {
        Nome: newUser.name,
        Email: newUser.email,
        Senha: newUser.password,
        DataNascimento: birthDateForBackend,
      });
    } catch (error) {
      // Just log the error, don't stop the user flow
      console.error("Error syncing user to backend (continuing in offline mode):", error);
    }

    return Promise.resolve();
  }

  // função que faz o login
  async login(id: string, password: string): Promise<User> {
    // Busca no SQLite
    // Suporta login por Email ou Telefone
    const rows = await this.db.executeQuery(
      "SELECT * FROM users WHERE (email = ? OR telefone = ?) AND senha_hash = ? LIMIT 1",
      [id, id, password]
    );

    if (rows.length > 0) {
      const row = rows[0];
      const user: User = {
        id: row.id,
        name: row.nome,
        email: row.email,
        phone: row.telefone,
        birthDate: row.data_nascimento,
        password: row.senha_hash,
        profilePicture: row.avatar ? JSON.parse(row.avatar) : null // Avatar might interpret based on how we save
      };

      // Salva sessão (AsyncStorage ainda é útil para persistir QUEM está logado)
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } else {
      throw new Error("Credenciais inválidas");
    }
  }

  // função que faz o logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }

  // função que pega o usuario atual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userJson) {
        return JSON.parse(userJson) as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // função que verifica se o usuario esta autenticado
  async isAuthenticated(): Promise<boolean> {
    try {
      const isAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const user = await this.getCurrentUser();
      return isAuth === "true" && user !== null;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  // função que salva o usuario no storage (update profile)
  async saveUser(user: User): Promise<void> {
    try {
      // 1. Atualizar sessão atual
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      // 2. Atualizar SQLite
      await this.db.executeQuery(
        `UPDATE users SET nome = ?, email = ?, senha_hash = ?, telefone = ?, data_nascimento = ?, avatar = ?, updated_at = ?
         WHERE id = ?`,
        [
          user.name,
          user.email,
          user.password,
          user.phone,
          user.birthDate,
          user.profilePicture, // assuming image uri string
          Date.now(),
          user.id
        ]
      );

    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Erro ao salvar usuário");
    }
  }

  // função que deleta o usuario
  async deleteUser(id: string): Promise<void> {
    try {
      // 1. Remove do SQLite
      await this.db.executeQuery("DELETE FROM users WHERE id = ?", [id]);

      // 2. Se for o usuário atual, faz logout
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        await this.logout();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Erro ao excluir usuário");
    }
  }
}
