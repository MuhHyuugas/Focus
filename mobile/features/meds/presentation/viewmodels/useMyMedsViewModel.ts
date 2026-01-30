import { MOCK_AVAILABLE_MEDICATIONS } from "@/data/mock/database";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { formatTime } from "../../utils/dateUtils";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();

// função que define o handler das notificações
export const useMyMedsViewModel = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // estado que define os dias selecionados
  const [times, setTimes] = useState<string[]>(["08:00"]); // estado que define as horas selecionadas
  const [medicationName, setMedicationName] = useState(""); // estado que define o nome do medicamento
  const [medications, setMedications] = useState<Medication[]>([]); // estado que define os medicamentos

  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(
    null,
  );

  // função que prepara a edição do medicamento
  const prepareEdit = (medication: Medication) => {
    setMedicationName(medication.name);
    setSelectedDays(medication.days);
    setTimes(medication.times);
    setEditingMedicationId(medication.id);
  };

  const [sideEffectsMap, setSideEffectsMap] = useState<
    Record<string, SideEffect[]>
  >({});

  // função que carrega os medicamentos
  const loadMedications = useCallback(async () => {
    const meds = await repository.getMedications();
    setMedications(meds);

    const allSideEffects = await sideEffectRepository.getSideEffects();
    const map: Record<string, SideEffect[]> = {};
    allSideEffects.forEach((effect) => {
      if (!map[effect.medicationId]) {
        map[effect.medicationId] = [];
      }
      map[effect.medicationId].push(effect);
    });
    setSideEffectsMap(map);
  }, []);

  // função que carrega a medicação

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  // função que define os dias selecionados
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // funções que definem as horas selecionadas
  const addTime = (time: string) => {
    if (!times.includes(time)) {
      setTimes([...times, time].sort());
    }
  };

  const removeTime = (time: string) => {
    setTimes(times.filter((t) => t !== time));
  };

  // função que salva o medicamento
  const saveMedication = async () => {
    if (!medicationName || selectedDays.length === 0 || times.length === 0) {
      alert("Preencha todo os campos!");
      return;
    }

    // função que cria o medicamento
    const newMedication: Medication = {
      id: editingMedicationId || Date.now().toString(),
      name: medicationName,
      days: selectedDays,
      times: times,
    };

    try {
      await repository.saveMedication(newMedication);
      await loadMedications();

      try {
        await scheduleNotificationsForMedication(newMedication);
      } catch (error) {
        console.warn("Error scheduling notifications:", error);
      }

      setMedicationName("");
      setSelectedDays([]);
      setTimes(["08:00"]);
      setEditingMedicationId(null);
    } catch (error) {
      console.error("Error saving medication:", error);
      alert("Erro ao salvar medicamento");
    }
  };

  const [filteredMedications, setFilteredMedications] = useState<string[]>([]);

  useEffect(() => {
    if (medicationName) {
      const filtered = MOCK_AVAILABLE_MEDICATIONS.filter((med) =>
        med.toLowerCase().includes(medicationName.toLowerCase()),
      );
      setFilteredMedications(filtered);
    } else {
      setFilteredMedications([]);
    }
  }, [medicationName]);

  const selectMedication = (name: string) => {
    setMedicationName(name);
    setFilteredMedications([]);
  };

  const clearHistory = async (medId: string) => {
    try {
      await sideEffectRepository.deleteSideEffectsByMedicationId(medId);
      await loadMedications();
      alert("Histórico limpo com sucesso!");
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Erro ao limpar histórico");
    }
  };

  // função que retorna os estados
  return {
    medicationName,
    setMedicationName,
    selectedDays,
    toggleDay,
    times,
    addTime,
    removeTime,
    medications,
    saveMedication,
    formatTime,
    filteredMedications,
    selectMedication,
    prepareEdit,
    editingMedicationId,
    sideEffectsMap,
    clearHistory,
  };
};

// Pesquisa rápida de dias selecionados

/**
 * Cancela todas as notificações agendadas para um medicamento específico.
 */
async function cancelNotificationsForMedication(medicationId: string) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      // Alguns ambientes Expo guardam o dado em content.data, outros em request.content.data
      const data =
        notification.content?.data ||
        (notification as any).request?.content?.data;

      // Verificação tripla: pelo ID no data, pela estrutura de request ou pelo prefixo do identifier
      if (
        data?.medicationId === medicationId ||
        notification.identifier.startsWith(`med_${medicationId}_`)
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }
  } catch (error) {
    console.warn("Error cancelling notifications:", error);
  }
}

// função que agenda as notificações
async function scheduleNotificationsForMedication(medication: Medication) {
  // 1. Primeiro, cancelamos notificações existentes para este medicamento para evitar duplicatas
  await cancelNotificationsForMedication(medication.id);

  const dayMapping: { [key: string]: number } = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sab: 6,
  };

  for (const time of medication.times) {
    const [hour, minute] = time.split(":").map(Number);

    if (Platform.OS === "android") {
      // Estratégia "Weekly" para Android:
      // Agendamos uma notificação recorrente (semanal) para CADA dia selecionado.
      // Isso substitui o DailyTrigger (que falha ou dispara imediato) e o DateTrigger (que não repete).
      for (const day of medication.days) {
        const weekdayDigit = dayMapping[day] + 1; // Dom=1, Seg=2, ..., Sab=7

        await Notifications.scheduleNotificationAsync({
          identifier: `med_${medication.id}_${day}_${time}`,
          content: {
            title: "Hora do remédio! 💊",
            body: `Está na hora de tomar ${medication.name}`,
            sound: true,
            data: { medicationId: medication.id, doseTime: time },
            color: "#179A9B", // Usando cor de marca (opcional)
          } as any, // 'as any' para permitir channelId se o tipo JS estiver desatualizado
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: weekdayDigit,
            hour,
            minute,
            repeats: true,
            channelId: "default", // Mantemos no trigger também por compatibilidade
          } as any, // 'as any' para forçar o objeto caso typescript reclame
        });
      }
    } else {
      // iOS suporta CALENDAR com weekday
      for (const day of medication.days) {
        const weekdayDigit = dayMapping[day] + 1; // iOS/Expo Calendar weekday é 1-7 (Dom-Sab)

        await Notifications.scheduleNotificationAsync({
          identifier: `med_${medication.id}_${day}_${time}`,
          content: {
            title: "Hora do remédio! 💊",
            body: `Está na hora de tomar ${medication.name}`,
            sound: true,
            data: { medicationId: medication.id, doseTime: time },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: weekdayDigit,
            hour,
            minute,
            repeats: true,
          },
        });
      }
    }
  }
}

