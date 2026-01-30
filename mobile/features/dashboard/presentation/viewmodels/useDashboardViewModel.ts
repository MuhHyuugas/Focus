import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { useAuthContext } from "@/features/auth/presentation/contexts/AuthContext";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();

export const useDashboardViewModel = () => {
  const { user } = useAuthContext(); // 
  const [hasMedications, setHasMedications] = useState(false); // estado se tem medicação cadastrada
  const [greeting, setGreeting] = useState(""); // saudação
  const [nextMedication, setNextMedication] = useState<Medication | null>(null); // próximo medicamento
  const [nextMedicationTime, setNextMedicationTime] = useState(""); // horário do próximo medicamento
  const [timeUntilNext, setTimeUntilNext] = useState(""); // tempo até o próximo medicamento

  // Stats States
  const [streakDays, setStreakDays] = useState(0); // dias seguidos tomando remédio
  const [adherenceRate, setAdherenceRate] = useState(0); // taxa de adesão
  const [topSideEffect, setTopSideEffect] = useState(""); // efeito colateral mais comum
  const [totalDoses, setTotalDoses] = useState(0); // total de doses tomadas
  const [bestTime, setBestTime] = useState(""); // horário de maior frequência de doses

  const getGreeting = () => {   // saudação
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getCurrentDaySlug = () => { // dia da semana
    const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
    return days[new Date().getDay()];
  };

  const calculateStats = async (meds: Medication[]) => { // cálculo de estatísticas
    try {
      //(Dias seguidos tomando remédio)
      const allTaken = await repository.getAllTakenDoses();

      // datas únicas ordenadas de forma decrescente
      const uniqueDates = Array.from(new Set(allTaken.map((d) => d.date))).sort(
        (a, b) => b.localeCompare(a),
      );

      let streak = 0;
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      // Se tomou hoje, conta. Se não tomou hoje mas tomou ontem, o streak continua.
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

      // (taxa de adesão)
      let scheduledCount = 0;
      let takenCount = 0;

      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const daySlug = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"][
          d.getDay()
        ];

        // Medicação programada para este dia
        const medsForDay = meds.filter((m) => m.days.includes(daySlug));
        const dosesForDay = medsForDay.reduce(
          (acc, curr) => acc + curr.times.length,
          0,
        );
        scheduledCount += dosesForDay;

        // Doses tomadas neste dia
        const takenThisDay = allTaken.filter((t) => t.date === dateStr).length;
        takenCount += takenThisDay;
      }

      if (scheduledCount > 0) {
        setAdherenceRate(Math.round((takenCount / scheduledCount) * 100));
      } else {
        setAdherenceRate(0);
      }

      // Efeito colateral mais comum
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

      // Total de doses
      setTotalDoses(allTaken.length);

      // Horário de maior frequência de doses
      if (allTaken.length > 0) {
        const hourCounts: Record<string, number> = {};
        allTaken.forEach((dose) => {
          const hour = dose.time.split(":")[0];
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const sortedHours = Object.entries(hourCounts).sort(
          (a, b) => b[1] - a[1],
        );
        if (sortedHours.length > 0) {
          setBestTime(`${sortedHours[0][0]}h`);
        } else {
          setBestTime("--");
        }
      } else {
        setBestTime("--");
      }
    } catch (e) {
      console.error("Error calculating stats", e);
    }
  };

  const checkMedications = useCallback(async () => {
    const meds = await repository.getMedications();
    setHasMedications(meds.length > 0);

    // Cálculo de estatísticas
    await calculateStats(meds);

    // Cálculo do próximo medicamento
    const todaySlug = getCurrentDaySlug();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const todayDate = now.toISOString().split("T")[0];

    const takenDoses = await repository.getTakenDoses(todayDate);

    // Filtrar medicamentos para hoje
    const todaysMeds = meds.filter((m) => m.days.includes(todaySlug));

    // Achatamento para todas as doses programadas para hoje: { time, med }
    let allDoses: { time: string; med: Medication }[] = [];
    todaysMeds.forEach((med) => {
      med.times.forEach((time) => {
        allDoses.push({ time, med });
      });
    });

    // Filtrar doses já tomadas
    allDoses = allDoses.filter(
      (dose) =>
        !takenDoses.some(
          (taken) => taken.medId === dose.med.id && taken.time === dose.time,
        ),
    );

    // Doses futuras
    const futureDoses = allDoses
      .filter((dose) => dose.time > currentTime)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (futureDoses.length > 0) {
      setNextMedication(futureDoses[0].med);
      setNextMedicationTime(futureDoses[0].time);
      updateTimeUntil(futureDoses[0].time);
    } else {
      setNextMedication(null);
      setNextMedicationTime("");
      setTimeUntilNext("");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkMedications();
      setGreeting(getGreeting());
    }, [checkMedications]),
  );

  // Atualizar tempo até o próximo medicamento
  const updateTimeUntil = (targetTime: string) => {
    const [h, m] = targetTime.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

  
    const diffMs = target.getTime() - now.getTime();
    if (diffMs > 0) {
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      setTimeUntilNext(`${diffHrs}h ${diffMins}min`);
    } else {
      setTimeUntilNext("Agora");
    }
  };

  // Confirmar dose adiantada
  const confirmEarlyDose = async () => {
    if (nextMedication && nextMedicationTime) {
      const now = new Date();
      const todayDate = now.toISOString().split("T")[0];
      await repository.markDoseTaken(
        nextMedication.id,
        nextMedicationTime,
        todayDate,
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
    adherenceRate,
    topSideEffect,
    totalDoses,
    bestTime,
  };
};
