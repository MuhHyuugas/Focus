import { MOODS } from "@/constants/moods";
import { SIDE_EFFECT_TYPES } from "@/constants/sideEffects";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { SaveSideEffect } from "@/features/sideEffects/domain/usecases/SaveSideEffect";
import { useEffect, useState } from "react";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();
const saveSideEffectUseCase = new SaveSideEffect(sideEffectRepository);

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
  const [selectedEffectTypeIds, setSelectedEffectTypeIds] = useState<string[]>(
    [],
  );
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
      const meds = await repository.getMedications();
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

  const saveSideEffects = async () => {
    if (!selectedMedicationId) {
      alert("Selecione um medicamento");
      return;
    }
    if (selectedEffectTypeIds.length === 0) {
      alert("Selecione pelo menos um efeito colateral");
      return;
    }

    try {
      // Loop through all selected effect IDs and save individually
      for (const typeId of selectedEffectTypeIds) {
        const effectType = SIDE_EFFECT_TYPES.find((t) => t.id === typeId);
        if (!effectType) continue;

        const newSideEffect: SideEffect = {
          id: "", // Let repo generate UUID
          medicationId: selectedMedicationId,
          description: effectType.name,
          notes: formatNotes(
            notesMap[typeId] || "",
            moodMap[typeId],
            anxietyMap[typeId],
            focusMap[typeId],
          ),
          date: new Date().toISOString(),
        };

        await saveSideEffectUseCase.execute(newSideEffect);
      }

      alert("Efeitos salvos com sucesso!");

      // Limpar formulário
      setSelectedMedicationId(undefined);
      setSelectedEffectTypeIds([]);
      setNotesMap({});
      setMoodMap({});
      setAnxietyMap({});
      setFocusMap({});
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar efeitos");
    }
  };

  return {
    medications,
    selectedMedicationId,
    setSelectedMedicationId,
    isLoading,
    sideEffectTypes: SIDE_EFFECT_TYPES,
    selectedEffectTypeIds,
    setSelectedEffectTypeIds,
    notesMap,
    updateNotes,
    moodMap,
    updateMood,
    anxietyMap,
    updateAnxiety,
    focusMap,
    updateFocus,
    saveSideEffects,
  };
};
