import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { Medication } from "@/features/meds/domain/entities/Medication";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { NotificationRepositoryImpl } from "@/features/notifications/data/NotificationRepositoryImpl";
import { ReportRepositoryImpl } from "@/features/report/data/repositories/ReportRepositoryImpl";
import { useAuthContext } from "@/features/auth/presentation/contexts/AuthContext";
import { GetNextDose } from "@/features/dashboard/domain/usecases/GetNextDose";
import { GetDashboardStats } from "@/features/dashboard/domain/usecases/GetDashboardStats";
import { MarkDoseTaken } from "@/features/dashboard/domain/usecases/MarkDoseTaken";
import { GetMedications } from "@/features/meds/domain/usecases/GetMedications";
import { GetNotificationsUseCase } from "@/features/notifications/domain/usecases/GetNotificationsUseCase";

// Repositories
const medRepository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();
const reportRepository = new ReportRepositoryImpl();

// Use Cases
const getNextDoseUseCase = new GetNextDose(medRepository);
const getDashboardStatsUseCase = new GetDashboardStats(
  medRepository,
  sideEffectRepository,
  reportRepository,
);
const markDoseTakenUseCase = new MarkDoseTaken(medRepository);
const getMedicationsUseCase = new GetMedications(
  medRepository,
  sideEffectRepository,
);
const getNotificationsUseCase = new GetNotificationsUseCase(
  notificationRepository,
);

/**
 * ViewModel responsável pela lógica do Dashboard.
 * Gerencia o estado das medicações, estatísticas do usuário e notificações.
 */
export const useDashboardViewModel = () => {
  const { user } = useAuthContext();

  const [hasMedications, setHasMedications] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);
  const [nextMedicationTime, setNextMedicationTime] = useState("");
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Stats States
  const [streakDays, setStreakDays] = useState(0);
  const [topSideEffect, setTopSideEffect] = useState("");

  /**
   * Verifica se existem notificações não lidas.
   */
  const checkNotifications = useCallback(async () => {
    try {
      const notifications = await getNotificationsUseCase.execute();
      const hasUnread = notifications.some((n: any) => !n.read);
      setHasUnreadNotifications(hasUnread);
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  }, []);

  /**
   * Define a saudação baseada no horário local.
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  /**
   * Atualiza todos os dados do dashboard (medicações, notificações e estatísticas).
   */
  const refreshDashboardData = useCallback(async () => {
    // Sincroniza tratamentos do servidor
    await medRepository.syncTreatments();
    await medRepository.syncDoseLogs();
    await reportRepository.syncData();
    await sideEffectRepository.syncData();

    // Verifica se existem medicações
    const { medications: treatments } = await getMedicationsUseCase.execute();
    setHasMedications(treatments.length > 0);

    // Verifica se existem notificações
    await checkNotifications();

    // Atualiza as estatísticas
    const stats = await getDashboardStatsUseCase.execute();
    setStreakDays(stats.streakDays);
    setTopSideEffect(stats.topSideEffect);

    // Procura a próxima dose
    const nextDose = await getNextDoseUseCase.execute();

    if (nextDose) {
      setNextMedication(nextDose.med);
      setNextMedicationTime(nextDose.time);
      setTimeUntilNext(nextDose.timeUntil);
    } else {
      setNextMedication(null);
      setNextMedicationTime("");
      setTimeUntilNext("");
    }
  }, [checkNotifications]);

  useFocusEffect(
    useCallback(() => {
      refreshDashboardData();
      setGreeting(getGreeting());
    }, [refreshDashboardData]),
  );

  /**
   * Confirma a ingestão da medicação (incluindo doses antecipadas).
   */
  const confirmEarlyDose = async () => {
    if (nextMedication && nextMedicationTime) {
      const todayDate = new Date().toISOString().split("T")[0];

      await markDoseTakenUseCase.execute(
        nextMedication.id,
        nextMedicationTime,
        todayDate,
        nextMedication.name,
      );

      await refreshDashboardData();
    }
  };

  const userName = user?.name ? user.name.split(" ")[0] : "Usuário";

  return {
    hasMedications,
    greeting,
    userName,
    nextMedication,
    nextMedicationTime,
    timeUntilNext,
    confirmEarlyDose,
    streakDays,
    topSideEffect,
    hasUnreadNotifications,
  };
};
