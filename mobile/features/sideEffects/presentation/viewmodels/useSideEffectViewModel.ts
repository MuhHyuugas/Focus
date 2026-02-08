import { MOODS } from "@/constants/moods";
import { SIDE_EFFECT_TYPES } from "@/constants/sideEffects";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SaveSideEffect } from "@/features/sideEffects/domain/usecases/SaveSideEffect";
import { GetMedications } from "@/features/meds/domain/usecases/GetMedications";
import { useEffect, useState } from "react";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const saveSideEffectUseCase = new SaveSideEffect(sideEffectRepository);
const getMedicationsUseCase = new GetMedications(
  repository,
  sideEffectRepository,
);

const formatNotes = (
  userNotes: string,
  mood: number | undefined,
  anxiety: boolean | undefined,
  focus: number | undefined,
): string => {
  const lines: string[] = [];

  if (mood) {
    const moodObj = MOODS.find((m) => m.value === mood);
    lines.push(`Humor: ${moodObj?.label || mood}`);
  }

  if (anxiety !== undefined) {
    if (anxiety) lines.push("Sentiu ansiedade: Sim");
  }

  if (focus) {
    lines.push(`Nível de foco: ${focus}`);
  }

  if (userNotes) {
    lines.push(`Notas: ${userNotes}`);
  }

  return lines.join("\n");
};

export const useSideEffectViewModel = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | undefined
  >(undefined);
  const [selectedEffectTypeId, setSelectedEffectTypeId] = useState<
    string | undefined
  >(undefined);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [moodMap, setMoodMap] = useState<Record<string, number | undefined>>(
    {},
  );
  const [anxietyMap, setAnxietyMap] = useState<Record<string, boolean>>({});
  const [focusMap, setFocusMap] = useState<Record<string, number | undefined>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const { medications: meds } = await getMedicationsUseCase.execute();
      setMedications(meds);
    } catch (error) {
      console.error("Failed to load medications", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotes = (id: string, text: string) => {
    setNotesMap((prev) => ({ ...prev, [id]: text }));
  };

  const updateMood = (id: string, mood: number | undefined) => {
    setMoodMap((prev) => ({ ...prev, [id]: mood }));
  };

  const updateAnxiety = (id: string, anxiety: boolean) => {
    setAnxietyMap((prev) => ({ ...prev, [id]: anxiety }));
  };

  const updateFocus = (id: string, focus: number | undefined) => {
    setFocusMap((prev) => ({ ...prev, [id]: focus }));
  };

  const saveSideEffect = async () => {
    if (!selectedMedicationId) {
      alert("Selecione um medicamento");
      return;
    }
    if (!selectedEffectTypeId) {
      alert("Selecione qual o efeito colateral");
      return;
    }

    try {
      const effectType = SIDE_EFFECT_TYPES.find((t) => t.id === selectedEffectTypeId);
      if (!effectType) return;

      const newSideEffect: SideEffect = {
        id: "", // Let repo generate UUID
        medicationId: selectedMedicationId,
        typeId: selectedEffectTypeId,
        description: effectType.name,
        notes: notesMap[selectedEffectTypeId] || "",
        date: new Date().toISOString(),
        mood: moodMap[selectedEffectTypeId],
        anxiety: anxietyMap[selectedEffectTypeId],
        focus: focusMap[selectedEffectTypeId],
      };

      console.log("Saving Side Effect:", JSON.stringify(newSideEffect, null, 2));

      await saveSideEffectUseCase.execute(newSideEffect);

      alert("Efeito salvo com sucesso!");

      // Limpar formulário
      setSelectedMedicationId(undefined);
      setSelectedEffectTypeId(undefined);
      setNotesMap({});
      setMoodMap({});
      setAnxietyMap({});
      setFocusMap({});
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar efeito");
    }
  };

  return {
    medications,
    selectedMedicationId,
    setSelectedMedicationId,
    isLoading,
    sideEffectTypes: SIDE_EFFECT_TYPES,
    selectedEffectTypeId,
    setSelectedEffectTypeId,
    notesMap,
    updateNotes,
    moodMap,
    updateMood,
    anxietyMap,
    updateAnxiety,
    focusMap,
    updateFocus,
    saveSideEffect,
  };
};
