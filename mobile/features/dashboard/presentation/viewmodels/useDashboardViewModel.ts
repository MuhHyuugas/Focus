import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { Medication } from "@/features/meds/domain/entities/Medication";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { NotificationRepositoryImpl } from "@/features/notifications/data/NotificationRepositoryImpl";
import { useAuthContext } from "@/features/auth/presentation/contexts/AuthContext";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

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
      const notifications = await notificationRepository.getNotifications();
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
   * Calcula as estatísticas de uso (streak e efeitos colaterais comuns).
   */
  const calculateStats = async (meds: Medication[]) => {
    try {
      const allTaken = await repository.getAllTakenDoses();

      const uniqueDates = Array.from(new Set(allTaken.map((d) => d.date))).sort(
        (a, b) => b.localeCompare(a),
      );

      let streak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      let currentDateToCheck = uniqueDates.includes(today) ? today : yesterday;

      if (uniqueDates.includes(currentDateToCheck)) {
        streak = 1;
        let checkDate = new Date(currentDateToCheck);

        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split("T")[0];
          if (uniqueDates.includes(dateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
      setStreakDays(streak);

      const sideEffects = await sideEffectRepository.getSideEffects();
      if (sideEffects.length > 0) {
        const counts: Record<string, number> = {};
        sideEffects.forEach((se) => {
          counts[se.description] = (counts[se.description] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        setTopSideEffect(sorted[0][0]);
      } else {
        setTopSideEffect("Nenhum");
      }
    } catch (e) {
      console.error("Error calculating stats", e);
    }
  };

  /**
   * Atualiza todos os dados do dashboard (medicações, notificações e estatísticas).
   */
  const refreshDashboardData = useCallback(async () => {
    const treatments = await repository.getMedications();
    setHasMedications(treatments.length > 0);
    await checkNotifications();
    await calculateStats(treatments);

    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const currentClockTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const takenDosesToday = await repository.getTakenDoses(todayISO);
    const weekDaySlugs = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

    let earliestNextDose: { med: Medication; time: string; date: Date } | null = null;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date();
      checkDate.setDate(now.getDate() + dayOffset);
      const currentDaySlug = weekDaySlugs[checkDate.getDay()];
      const isCheckingToday = dayOffset === 0;

      const scheduledMedsForDay = treatments.filter((m) => m.days.includes(currentDaySlug));
      let doseCandidates: { med: Medication; time: string; date: Date }[] = [];

      scheduledMedsForDay.forEach((med) => {
        med.times.forEach((time) => {
          const [hour, minute] = time.split(":").map(Number);
          const scheduledDoseDate = new Date(checkDate);
          scheduledDoseDate.setHours(hour, minute, 0, 0);

          if (isCheckingToday) {
            if (time > currentClockTime) {
              const isAlreadyTaken = takenDosesToday.some(
                (t) => t.medId === med.id && t.time === time,
              );
              if (!isAlreadyTaken) {
                doseCandidates.push({ med, time, date: scheduledDoseDate });
              }
            }
          } else {
            doseCandidates.push({ med, time, date: scheduledDoseDate });
          }
        });
      });

      if (doseCandidates.length > 0) {
        doseCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());
        earliestNextDose = doseCandidates[0];
        break;
      }
    }

    if (earliestNextDose) {
      setNextMedication(earliestNextDose.med);
      setNextMedicationTime(earliestNextDose.time);
      updateTimeUntil(earliestNextDose.date);
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
   * Calcula o tempo restante amigável até a próxima dose.
   */
  const updateTimeUntil = (targetDate: Date) => {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      setTimeUntilNext("Agora");
      return;
    }

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
      const remainingHours = diffHrs % 24;
      setTimeUntilNext(`${diffDays}d ${remainingHours}h`);
    } else {
      setTimeUntilNext(`${diffHrs}h ${diffMins}min`);
    }
  };

  /**
   * Confirma a ingestão da medicação (incluindo doses antecipadas).
   */
  const confirmEarlyDose = async (
    mood?: number,
    anxiety?: boolean,
    focus?: number,
    notes?: string,
  ) => {
    if (nextMedication && nextMedicationTime) {
      const now = new Date();
      const todayDate = now.toISOString().split("T")[0];
      const actualTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      await repository.markDoseTaken(
        nextMedication.id,
        nextMedicationTime,
        todayDate,
        actualTime,
        nextMedication.name,
        mood,
        anxiety,
        focus,
        notes,
      );
      await repository.markDateAsTaken(todayDate);
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

