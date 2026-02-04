import { Medication } from "@/features/meds/domain/entities/Medication";
import { formatTime } from "@/features/meds/utils/dateUtils";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { PillBottle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MedItemProps {
  medication: Medication;
  sideEffects: SideEffect[];
}

const MedItem = ({ medication, sideEffects }: MedItemProps) => {
  const hasMoreThanTwoTimes = medication.times.length > 2;
  const initialTimes = hasMoreThanTwoTimes
    ? medication.times.slice(0, 2)
    : medication.times;
  const remainingTimes = hasMoreThanTwoTimes ? medication.times.slice(2) : [];
  const [isExpanded, setIsExpanded] = React.useState(false);

  const showExpandButton = hasMoreThanTwoTimes || sideEffects.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  return (
    <View className="p-4 rounded-xl bg-neutral-100">
      <View className="flex-row justify-between items-start">
        <View className="flex flex-row items-center gap-2 flex-1 pr-2">
          <PillBottle size={36} color="#179A9B" />
          <View className="p-2 shrink">
            <Text
              className="text-xl font-semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {medication.name}
            </Text>
            <Text
              className="text-xs text-gray-500"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {medication.days.join(", ")}
            </Text>
          </View>
        </View>

        <View className="items-end max-w-[50%]">
          <Text className="text-base font-semibold text-right">
            {initialTimes.map(formatTime).join("\n")}
          </Text>
          {showExpandButton && (
            <View className="items-end w-full">
              {isExpanded && (
                <Text className="text-base font-semibold text-right">
                  {remainingTimes.map(formatTime).join("\n")}
                </Text>
              )}
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text className="text-xs text-[#179A9B] mt-1">
                  {isExpanded ? "Ver menos" : "Ver mais"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {isExpanded && sideEffects.length > 0 && (
        <View className="mt-2 w-full flex flex-col items-start border-t border-gray-200 pt-2">
          <Text className="text-medium font-bold text-gray-700 text-left mb-1">
            Efeitos colaterais:
          </Text>
          {sideEffects.map((effect) => (
            <View key={effect.id} className="mb-2">
              <Text className="text-xs text-left text-gray-600 font-semibold">
                {formatDate(effect.date)} - {effect.description}
              </Text>
              {effect.notes ? (
                <Text className="text-xs text-left text-gray-500 italic">
                  - {effect.notes}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default MedItem;
