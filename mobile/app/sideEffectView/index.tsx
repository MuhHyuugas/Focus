import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useSideEffectViewModel } from "@/features/sideEffects/presentation/viewmodels/useSideEffectViewModel";
import { Stack } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { images } from "@/assets/assets";
import EffectItem from "./components/effectItem";

const SideEffectView = () => {
  const {
    medications,
    setSelectedMedicationId,
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
          <View className="m-2 mt-8 bg-neutral-100 p-2 rounded-xl">
            <Text className="text-2xl font-bold">
              Selecione o medicamento que causou o efeito colateral:
            </Text>

            <View className="flex flex-row items-center justify-between gap-4">
              <Select
                className="flex-1"
                onValueChange={(option) =>
                  setSelectedMedicationId(option?.value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} label={med.name} value={med.id} />
                  ))}
                </SelectContent>
              </Select>
              <Image source={images.medshield} className="w-24 h-24 m-4" />
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
