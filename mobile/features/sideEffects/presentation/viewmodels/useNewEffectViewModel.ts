import { MOCK_SIDE_EFFECT_TYPES } from "@/data/mock/database";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffectRepositoryImpl } from "@/features/sideEffects/data/SideEffectRepositoryImpl";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const repository = new MedicationRepositoryImpl();
const sideEffectRepository = new SideEffectRepositoryImpl();

export const useNewEffectViewModel = () => {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | undefined
  >(undefined);
  const [selectedEffectTypeId, setSelectedEffectTypeId] = useState<
    string | undefined
  >(undefined);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
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

  const saveSideEffect = async () => {
    if (!selectedMedicationId) {
      alert("Selecione um medicamento");
      return;
    }
    if (!selectedEffectTypeId) {
      alert("Selecione um efeito colateral");
      return;
    }

    const effectType = MOCK_SIDE_EFFECT_TYPES.find(
      (t) => t.id === selectedEffectTypeId,
    );
    if (!effectType) return;

    const newSideEffect: SideEffect = {
      id: Date.now().toString(),
      medicationId: selectedMedicationId,
      description: effectType.name,
      notes: notesMap[selectedEffectTypeId] || "",
      date: new Date().toISOString(),
    };

    try {
      await sideEffectRepository.saveSideEffect(newSideEffect);
      router.back();
    } catch {
      alert("Erro ao salvar efeito");
    }
  };

  return {
    medications,
    selectedMedicationId,
    setSelectedMedicationId,
    isLoading,
    sideEffectTypes: MOCK_SIDE_EFFECT_TYPES,
    selectedEffectTypeId,
    setSelectedEffectTypeId,
    notesMap,
    updateNotes,
    saveSideEffect,
  };
};
