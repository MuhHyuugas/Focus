import { useRouter } from "expo-router";
import { useState } from "react";
import { AuthRepositoryImpl } from "../../data/AuthRepositoryImpl";
import { LogoutUseCase } from "../../domain/use-cases/LogoutUseCase";

import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { ReportRepositoryImpl } from "@/features/report/data/repositories/ReportRepositoryImpl";
import { ExpoNotificationService } from "@/features/notifications/infrastructure/services/ExpoNotificationService";
import { useAuthContext } from "../contexts/AuthContext";

const authRepository = new AuthRepositoryImpl();
const medicationRepository = new MedicationRepositoryImpl();
const reportRepository = new ReportRepositoryImpl();
const notificationService = new ExpoNotificationService();

const logoutUseCase = new LogoutUseCase(
  authRepository,
  medicationRepository,
  reportRepository,
  notificationService,
);

export function useLogoutViewModel() {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUseCase.execute();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/authView");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer logout");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    isLoading,
    error,
  };
}
