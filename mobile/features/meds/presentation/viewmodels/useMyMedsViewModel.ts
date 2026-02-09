import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { formatTime } from "../../utils/dateUtils";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { GetMedications } from "@/features/meds/domain/usecases/GetMedications";
import { SaveMedication } from "@/features/meds/domain/usecases/SaveMedication";
import { SyncCatalog } from "@/features/meds/domain/usecases/SyncCatalog";
import { SearchMedications } from "@/features/meds/domain/usecases/SearchMedications";
import { ClearMedicationHistory } from "@/features/meds/domain/usecases/ClearMedicationHistory";

import { ExpoNotificationService } from "@/features/notifications/infrastructure/services/ExpoNotificationService";

// repositorios
const medRepository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const notificationService = new ExpoNotificationService();

// Use Cases
const getMedicationsUseCase = new GetMedications(
  medRepository,
  sideEffectRepository,
);
const saveMedicationUseCase = new SaveMedication(
  medRepository,
  notificationService,
);
const syncCatalogUseCase = new SyncCatalog(medRepository);
const searchMedicationsUseCase = new SearchMedications(medRepository);
const clearMedicationHistoryUseCase = new ClearMedicationHistory(
  sideEffectRepository,
);

// define o handler das notificações
export const useMyMedsViewModel = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // define os dias selecionados
  const [times, setTimes] = useState<string[]>(["08:00"]); // define as horas selecionadas
  const [medicationName, setMedicationName] = useState(""); // define o nome do medicamento
  const [dosage, setDosage] = useState(""); // define da dosagem
  const [medications, setMedications] = useState<Medication[]>([]); // estado que define os medicamentos

  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(
    null,
  );

  // prepara a edição do medicamento
  const prepareEdit = (medication: Medication) => {
    setMedicationName(medication.name);
    setDosage(medication.dosage || "");
    setSelectedDays(medication.days);
    setTimes(medication.times);
    setEditingMedicationId(medication.id);
  };

  const [sideEffectsMap, setSideEffectsMap] = useState<
    Record<string, SideEffect[]>
  >({});

  // carrega os medicamentos
  const loadMedications = useCallback(async () => {
    // sincroniza o catalogo
    syncCatalogUseCase.execute().catch((e) => console.warn("Sync failed", e));

    // carrega os medicamentos
    const result = await getMedicationsUseCase.execute();
    setMedications(result.medications.slice(0, 1));
    setSideEffectsMap(result.sideEffectsMap);
  }, []);

  // carrega a medicação

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  // define os dias selecionados
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // define as horas selecionadas
  const addTime = (time: string) => {
    if (!times.includes(time)) {
      setTimes([...times, time].sort());
    }
  };

  const removeTime = (time: string) => {
    setTimes(times.filter((t) => t !== time));
  };

  const resetForm = () => {
    setMedicationName("");
    setDosage("");
    setSelectedDays([]);
    setTimes(["08:00"]);
    setEditingMedicationId(null);
  };

  // salva o medicamento
  const saveMedication = async (): Promise<boolean> => {
    if (!medicationName || selectedDays.length === 0 || times.length === 0) {
      alert("Preencha todo os campos!");
      return false;
    }

    // cria o medicamento
    const newMedication: Medication = {
      id: editingMedicationId || "", // Envia vazio para o repo gerar o UUID
      name: medicationName,
      dosage: dosage,
      days: selectedDays,
      times: times,
    };

    try {
      await saveMedicationUseCase.execute(newMedication);
      await loadMedications();

      resetForm();
      return true;
    } catch (error) {
      console.error("Error saving medication:", error);
      alert("Erro ao salvar medicamento");
      return false;
    }
  };

  const [filteredMedications, setFilteredMedications] = useState<
    { id: string; name: string; defaultDosage: string }[]
  >([]);

  useEffect(() => {
    const search = async () => {
      if (medicationName && medicationName.length > 1) {
        // Usa Use Case para pesquisar medicamentos
        const filtered = await searchMedicationsUseCase.execute(medicationName);
        setFilteredMedications(filtered);
      } else {
        setFilteredMedications([]);
      }
    };

    // Implementação básica de debounce
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [medicationName]);

  const selectMedication = (med: { name: string; defaultDosage: string }) => {
    setMedicationName(med.name);
    setDosage(med.defaultDosage); // Preenche a dosagem
    setFilteredMedications([]);
  };

  const clearHistory = async (medId: string) => {
    try {
      await clearMedicationHistoryUseCase.execute(medId);
      await loadMedications();
      alert("Histórico limpo com sucesso!");
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Erro ao limpar histórico");
    }
  };

  // retorna os estados
  return {
    medicationName,
    setMedicationName,
    dosage,
    setDosage,
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
    resetForm,
  };
};
