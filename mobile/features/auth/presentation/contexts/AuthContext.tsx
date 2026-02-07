import { User } from "@/features/auth/domain/entities/User";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthRepositoryImpl } from "../../data/AuthRepositoryImpl";
import { CheckAuthStateUseCase } from "../../domain/use-cases/CheckAuthStateUseCase";
import { GetCurrentUserUseCase } from "../../domain/use-cases/GetCurrentUserUseCase";
import { ExpoNotificationService } from "@/features/notifications/infrastructure/services/ExpoNotificationService";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { LogoutUseCase } from "../../domain/use-cases/LogoutUseCase";
import { ReportRepositoryImpl } from "@/features/report/data/repositories/ReportRepositoryImpl";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean | null;
  isLoading: boolean;
  checkAuthState: () => Promise<void>;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authRepository = new AuthRepositoryImpl();
const medicationRepository = new MedicationRepositoryImpl();
const reportRepository = new ReportRepositoryImpl();
const notificationService = new ExpoNotificationService();

const checkAuthStateUseCase = new CheckAuthStateUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(
  authRepository,
  medicationRepository,
  reportRepository,
  notificationService,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const authenticated = await checkAuthStateUseCase.execute();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const currentUser = await getCurrentUserUseCase.execute();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUseCase.execute();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        checkAuthState,
        setUser,
        setIsAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
