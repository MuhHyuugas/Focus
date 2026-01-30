import { RegisterData } from "../entities/RegisterData";
import { User } from "../entities/User";

// interface que define as operações do repositorio de autenticação
export interface AuthRepository {
  register(data: RegisterData): Promise<void>;
  login(id: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
  saveUser(user: User): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
