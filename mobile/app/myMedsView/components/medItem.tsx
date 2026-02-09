import { Medication } from "@/features/meds/domain/entities/Medication";
import { formatTime } from "@/features/meds/utils/dateUtils";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { PillBottle, Clock, Calendar, AlertCircle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface MedItemProps {
  medication: Medication;
  sideEffects: SideEffect[];
}

const MedItem = ({ medication, sideEffects }: MedItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <View className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* Header Section: Name & Dosage */}
      <View className="bg-[#179A9B] p-6 flex-row items-center gap-4">
        <View className="bg-white/20 p-3 rounded-full">
          <PillBottle size={32} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white mb-1">
            {medication.name}
          </Text>
          {medication.dosage && (
            <View className="self-start bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white font-medium text-sm">
                {medication.dosage}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Schedule Section */}
      <View className="p-6 border-b border-gray-100">
        <View className="flex-row items-start mb-4">
          <Calendar size={20} color="#6B7280" className="mt-1" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-500 font-medium mb-1 uppercase text-xs tracking-wider">
              Frequência
            </Text>
            <Text className="text-gray-800 text-lg font-semibold">
              {medication.days.join(", ")}
            </Text>
          </View>
        </View>

        <View className="flex-row items-start">
          <Clock size={20} color="#6B7280" className="mt-1" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-500 font-medium mb-1 uppercase text-xs tracking-wider">
              Horários
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {medication.times.map((time, index) => (
                <View key={index} className="bg-gray-100 px-3 py-1 rounded-md">
                  <Text className="text-gray-700 font-semibold">
                    {formatTime(time)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Side Effects Log Section */}
      <View className="p-6 bg-gray-50/50">
        <View className="flex-row items-center mb-4">
          <AlertCircle size={20} color="#EF4444" />
          <Text className="ml-2 text-lg font-bold text-gray-800">
            Histórico de Efeitos
          </Text>
        </View>

        {sideEffects.length > 0 ? (
          <View className="gap-3">
            {sideEffects.map((effect, index) => (
              <View
                key={`${effect.id}-${index}`}
                className="flex-row items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
              >
                <View className="w-1 h-full bg-red-400 rounded-full mr-3 ml-1" />
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs font-medium mb-1">
                    {formatDate(effect.date)}
                  </Text>
                  <Text className="text-gray-800 font-medium text-base mb-1">
                    {effect.description}
                  </Text>
                  {effect.notes ? (
                    <Text className="text-gray-500 text-sm italic">
                      &quot;{effect.notes}&quot;
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-4 items-center justify-center">
            <Text className="text-gray-400 italic text-center">
              Nenhum efeito colateral registrado.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MedItem;
