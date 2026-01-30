import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { useAuthContext } from "@/features/auth/presentation/contexts/AuthContext";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { useFocusEffect } from "expo-router";
import { NotificationRepositoryImpl } from "@/features/notifications/data/NotificationRepositoryImpl";
import { useCallback, useState } from "react";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();

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

  const checkNotifications = useCallback(async () => {
    try {
      const notifications = await notificationRepository.getNotifications();
      const hasUnread = notifications.some((n: any) => !n.read);
      setHasUnreadNotifications(hasUnread);
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

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

  const checkMedications = useCallback(async () => {
    const meds = await repository.getMedications();
    setHasMedications(meds.length > 0);
    await checkNotifications();
    await calculateStats(meds);

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const takenDoses = await repository.getTakenDoses(todayDate);
    const daySlugs = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

    // Helper to find next dose
    let foundNext: { med: Medication; time: string; date: Date } | null = null;

    // Check up to 7 days ahead
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(now.getDate() + i);
      const daySlug = daySlugs[checkDate.getDay()];
      const isToday = i === 0;

      // Meds programmed for this day
      const medsForDay = meds.filter((m) => m.days.includes(daySlug));

      let candidates: { med: Medication; time: string; date: Date }[] = [];

      medsForDay.forEach((med) => {
        med.times.forEach((time) => {
          const [h, m] = time.split(":").map(Number);
          const doseDate = new Date(checkDate);
          doseDate.setHours(h, m, 0, 0);

          if (isToday) {
            // If today, must be in future AND not taken
            if (time > currentTime) {
              // Check if taken (only relevant for today usually)
              const alreadyTaken = takenDoses.some(
                (t) => t.medId === med.id && t.time === time,
              );
              if (!alreadyTaken) {
                candidates.push({ med, time, date: doseDate });
              }
            }
          } else {
            // Future days: assume not taken yet
            candidates.push({ med, time, date: doseDate });
          }
        });
      });

      if (candidates.length > 0) {
        // Sort by time
        candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
        foundNext = candidates[0];
        break; // Found the earliest next dose
      }
    }

    if (foundNext) {
      setNextMedication(foundNext.med);
      setNextMedicationTime(foundNext.time);
      updateTimeUntil(foundNext.date);
    } else {
      setNextMedication(null);
      setNextMedicationTime("");
      setTimeUntilNext("");
    }
  }, [checkNotifications]);

  useFocusEffect(
    useCallback(() => {
      checkMedications();
      setGreeting(getGreeting());
    }, [checkMedications]),
  );

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

  const confirmEarlyDose = async () => {
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
      );
      await repository.markDateAsTaken(todayDate);
      await checkMedications();
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
