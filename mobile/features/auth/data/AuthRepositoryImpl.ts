import { RegisterData } from "../domain/entities/RegisterData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/entities/User";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import api from "@/lib/api";

const USER_STORAGE_KEY = "@focus:key_users";
const AUTH_STORAGE_KEY = "@focus:isAuthenticated";
const CURRENT_USER_KEY = "@focus:currentUser";

//classe que implementa o repositorio de autenticação
export class AuthRepositoryImpl implements AuthRepository {
  //
  private async _ensureUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (usersJson) {
        return JSON.parse(usersJson);
      }
      // Se vazio, retorna vazio
      if (!usersJson) {
        return [];
      }
      return JSON.parse(usersJson);
    } catch (e) {
      console.error("Error ensuring users", e);
      return [];
    }
  }

  async register(data: RegisterData): Promise<void> {
    const users = await this._ensureUsers();

    // verifica se o usuario ja existe
    const exists = users.some(
      (u) => u.email === data.email || u.phone === data.phone,
    );
    if (exists) {
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

    // 1. Save Locally FIRST (Offline-First)
    users.push(newUser);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

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
    try {
      //faz o login no backend
      const response = await api.post("/api/Usuarios/login", {
        email: id,
        password: password,
      });
      //pega o usuario
      const user = response.data;
      //salva o usuario no storage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Error logging in", error);
      throw error;
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

      // 2. Atualizar lista de usuários
      const users = await this._ensureUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      }
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Erro ao salvar usuário");
    }
  }

  // função que deleta o usuario
  async deleteUser(id: string): Promise<void> {
    try {
      // 1. Remove da lista de usuários
      const users = await this._ensureUsers();
      const newUsers = users.filter((u) => u.id !== id);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUsers));

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
