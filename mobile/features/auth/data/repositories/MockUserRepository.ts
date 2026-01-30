import { MOCK_USERS } from "@/data/mock/database";
import { RegisterData } from "../../domain/entities/RegisterData";
import { User } from "../../domain/entities/User";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class MockUserRepository implements AuthRepository {
  private static currentUser: User | null = null;
  private static users: User[] = [...MOCK_USERS];

  async register(data: RegisterData): Promise<void> {
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      birthDate: data.birthDate,
      profilePicture: null,
    };
    MockUserRepository.users.push(newUser);
    console.log("User registered:", newUser);
    return Promise.resolve();
  }

  async login(id: string, password: string): Promise<User> {
    const user = MockUserRepository.users.find((u) => {
      const isEmail = u.email.toLowerCase() === id.toLowerCase();
      const isPhone = u.phone === id;
      return (isEmail || isPhone) && u.password === password;
    });

    if (user) {
      MockUserRepository.currentUser = user;
      return Promise.resolve(user);
    }

    throw new Error("Credenciais inválidas");
  }

  async logout(): Promise<void> {
    MockUserRepository.currentUser = null;
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<User | null> {
    return Promise.resolve(MockUserRepository.currentUser);
  }

  async isAuthenticated(): Promise<boolean> {
    return Promise.resolve(MockUserRepository.currentUser !== null);
  }

  async saveUser(user: User): Promise<void> {
    MockUserRepository.currentUser = user;
    const index = MockUserRepository.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      MockUserRepository.users[index] = user;
    }
    return Promise.resolve();
  }
}
