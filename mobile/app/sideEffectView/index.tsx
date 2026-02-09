import { PillBottle } from "lucide-react-native";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { Text } from "@/components/ui/text";
import { useSideEffectViewModel } from "@/features/sideEffects/presentation/viewmodels/useSideEffectViewModel";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { images } from "@/assets/assets";
import EffectItem from "./components/effectItem";

const SideEffectView = () => {
  const {
    medications,
    selectedMedicationId,
    sideEffectTypes,
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
  } = useSideEffectViewModel();

  const selectedMedication = medications.find(
    (m) => m.id === selectedMedicationId,
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Registrar efeito colateral",
          headerRight: () => <ProfileAvatar className="mr-4" />,
        }}
      />
      <ScrollView>
        <View className="p-2">
          {/* Active Medication Card */}
          <View className="m-2 mt-4 bg-[#179A9B] rounded-3xl p-6 shadow-sm flex-row items-center gap-4">
            <View className="bg-white/20 p-3 rounded-full">
              <PillBottle size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-medium opacity-80 uppercase tracking-wider mb-1">
                Medicamento:
              </Text>
              <Text className="text-2xl font-bold text-white mb-1">
                {selectedMedication?.name || "Nenhum medicamento"}
              </Text>
              {selectedMedication?.dosage && (
                <View className="self-start bg-white/20 px-3 py-1 rounded-full mt-1">
                  <Text className="text-white font-medium text-xs">
                    {selectedMedication.dosage}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="m-2 mt-4 bg-neutral-100 rounded-xl p-4">
            <Text className="text-2xl font-bold mb-4">
              Qual o efeito colateral?
            </Text>
            <Accordion
              type="single"
              collapsible
              value={selectedEffectTypeId}
              onValueChange={setSelectedEffectTypeId}
            >
              {sideEffectTypes.map((effect) => {
                let effectImage = images.others;
                switch (effect.id) {
                  case "type-1":
                    effectImage = images.happy;
                    break;
                  case "type-2":
                    effectImage = images.target;
                    break;
                  case "type-3":
                    effectImage = images.sick;
                    break;
                  case "type-4":
                    effectImage = images.sleep;
                    break;
                  case "type-5":
                    effectImage = images.others;
                    break;
                }

                return (
                  <EffectItem
                    key={effect.id}
                    id={effect.id}
                    text={effect.name}
                    description={effect.description}
                    image={effectImage}
                    notes={notesMap[effect.id] || ""}
                    onChangeNotes={(value) => updateNotes(effect.id, value)}
                    mood={moodMap[effect.id]}
                    onMoodChange={(value) => updateMood(effect.id, value)}
                    anxiety={anxietyMap[effect.id]}
                    onAnxietyChange={(value) => updateAnxiety(effect.id, value)}
                    focus={focusMap[effect.id]}
                    onFocusChange={(value) => updateFocus(effect.id, value)}
                  />
                );
              })}
            </Accordion>
          </View>
          <Button
            onPress={saveSideEffect}
            className="text-primary-foreground justify-center items-center "
          >
            <Text className="text-base text-white font-semibold px-2">
              Adicionar efeito colateral
            </Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

export default SideEffectView;
