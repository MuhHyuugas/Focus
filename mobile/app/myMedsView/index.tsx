import { images } from "@/assets/assets";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useMyMedsViewModel } from "@/features/meds/presentation/viewmodels/useMyMedsViewModel";

import { PencilLine } from "lucide-react-native";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import DaySelector from "./components/daySelector";
import MedItem from "./components/medItem";
import TimeSelector from "./components/timeSelector";


const MyMedsView = () => {
  const {
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
    dosage,
  } = useMyMedsViewModel();

  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  return (
    <>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-2">
          <View className="m-2">
            <View className="flex items-start justify-start bg-neutral-100 p-2 m-4 rounded-xl">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-2xl font-bold w-2/3 p-2">
                  Cadastrar novo medicamento
                </Text>
                <Image source={images.medshield} className="w-12 h-12" />
              </View>

              <View className="flex flex-col p-2 justify-start w-full">
                <View className="flex flex-row items-center gap-2">
                  <Text>Nome:</Text>
                  <View className="flex-1 relative">
                    <Input
                      placeholder="Nome do medicamento"
                      value={medicationName}
                      onChangeText={setMedicationName}
                      className="text-base"
                      containerClassName="flex-1"
                    />
                    {filteredMedications.length > 0 && (
                      <View
                        className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40"
                        style={{ zIndex: 100, elevation: 10 }}
                      >
                        <ScrollView
                          nestedScrollEnabled={true}
                          keyboardShouldPersistTaps="always"
                          className="w-full"
                        >
                          {filteredMedications.map((item) => (
                            <TouchableOpacity
                              key={item.name}
                              onPress={() => selectMedication(item)}
                              className="p-3 border-b border-gray-100"
                            >
                              <Text>{item.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex flex-row items-center gap-2">
                  <Text>Dosagem:</Text>
                  <View className="flex-1">
                    <Input
                      placeholder="Dosagem (Automático)"
                      value={dosage}
                      editable={false}
                      className="text-base bg-gray-100 text-gray-500"
                      containerClassName="flex-1"
                    />
                  </View>
                </View>

                <View className="flex flex-row items-center justify-start gap-2">
                  <Text>Dias:</Text>
                  <DaySelector
                    selectedDays={selectedDays}
                    onToggleDay={toggleDay}
                  />
                </View>

                <View className="flex flex-row items-center justify-start gap-2">
                  <Text className="mt-2">Horário:</Text>
                  <View className="flex-1">
                    <TimeSelector
                      times={times}
                      onAddTime={addTime}
                      onRemoveTime={removeTime}
                      formatTime={formatTime}
                    />
                  </View>
                </View>

                {editingMedicationId && (
                  <TouchableOpacity
                    onPress={() => clearHistory(editingMedicationId)}
                    className="self-center mt-4 p-2"
                  >
                    <Text className="text-red-500 font-semibold underline">
                      Limpar Histórico de Efeitos
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={saveMedication}
                  className="text-primary-foreground mx-4 justify-center items-center "
                >
                  <View className="flex flex-row items-center justify-center bg-[#179A9B] m-4 p-2 rounded-full shadow-lg ">
                    <Text className="text-base text-white font-semibold px-2">
                      {editingMedicationId
                        ? "Salvar alteração"
                        : "Adicionar medicamento"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="justify-end items-end text-primary-foreground mx-4 "
            >
              <View
                className={`flex flex-row items-center justify-between p-2 px-4 rounded-full shadow-lg ${isEditing ? "bg-red-500" : "bg-[#179A9B]"
                  }`}
              >
                <Text className="text-base text-white font-semibold px-2">
                  {isEditing ? "Parar edição" : "Editar medicamentos"}
                </Text>
                <PencilLine size={24} color="white" />
              </View>
            </TouchableOpacity>
            <View className="m-4 gap-2">
              {medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  disabled={!isEditing}
                  onPress={() => {
                    prepareEdit(med);
                    scrollRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                >
                  <View
                    className={`rounded-xl ${isEditing ? "border-2 border-[#179A9B]" : ""
                      }`}
                  >
                    <MedItem
                      medication={med}
                      sideEffects={sideEffectsMap[med.id] || []}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default MyMedsView;
