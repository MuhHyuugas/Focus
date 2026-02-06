import { RegisterData } from "../domain/entities/RegisterData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../domain/entities/User";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import api from "@/lib/api";
import { DatabaseService } from "@/data/local/DatabaseService";

const AUTH_STORAGE_KEY = "@focus:isAuthenticated";
const CURRENT_USER_KEY = "@focus:currentUser";

//classe que implementa o repositorio de autenticação
export class AuthRepositoryImpl implements AuthRepository {
  async register(data: RegisterData): Promise<void> {
    try {
      // Formata data para o padrão do backend
      const [day, month, year] = data.birthDate.split("/");
      const birthDateForBackend = `${year}-${month}-${day}`;

      await api.post("/api/Usuarios", {
        Nome: data.name,
        Email: data.email,
        Senha: data.password,
        DataNascimento: birthDateForBackend,
        Telefone: data.phone,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  async login(id: string, password: string): Promise<User> {
    try {
      const response = await api.post("/api/Usuarios/login", {
        Email: id,
        Senha: password,
      });

      // Backend returns camelCase by default: { token, usuario }
      const token = response.data.token || response.data.Token;
      const usuarioBackend = response.data.usuario || response.data.Usuario;

      // Format Backend Date (ISO) back to DD/MM/YYYY for App
      let formattedDate = "";
      if (usuarioBackend.dataNascimento) {
        const dateObj = new Date(usuarioBackend.dataNascimento);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        formattedDate = `${day}/${month}/${year}`;
      }

      const user: User = {
        id: usuarioBackend.id,
        name: usuarioBackend.nome,
        email: usuarioBackend.email,
        phone: usuarioBackend.telefone,
        birthDate: formattedDate,
        password: "", // Security: Don't store password locally
        profilePicture: usuarioBackend.avatar,
      };

      // Persist Session
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem("@focus:token", token);

      // Synchonize with Local SQLite for offline support
      try {
        const db = DatabaseService.getInstance();
        const existing = await db.executeQuery(
          "SELECT id FROM users WHERE id = ?",
          [user.id],
        );
        if (existing.length > 0) {
          await db.executeQuery(
            "UPDATE users SET nome = ?, email = ?, updated_at = ? WHERE id = ?",
            [user.name, user.email, Date.now(), user.id],
          );
        } else {
          await db.executeQuery(
            "INSERT INTO users (id, nome, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            [user.id, user.name, user.email, Date.now(), Date.now()],
          );
        }
      } catch (dbError) {
        console.error("Failed to sync user to local DB", dbError);
      }

      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Credenciais inválidas");
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    await AsyncStorage.removeItem("@focus:token");
  }

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

  async saveUser(user: User): Promise<void> {
    // Backend Update not implemented yet.
    // Update local session only.
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user session:", error);
    }
  }

  async deleteUser(id: string): Promise<void> {
    // Backend Delete not implemented yet.
    // Local Logout only.
    try {
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        await this.logout();
      }
    } catch (error) {
      console.error("Error deleting user session:", error);
    }
  }
}
