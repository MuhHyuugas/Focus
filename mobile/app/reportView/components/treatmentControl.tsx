import { Text } from "@/components/ui/text";
import { HistoryItem } from "@/features/report/domain/entities/HistoryItem";
import { ScrollView, View } from "react-native";
import TreatmentDetail from "./treatmentDetail";

interface TreatmentControlProps {
  items: HistoryItem[];
  medicationName?: string;
}

export default function TreatmentControl({
  items,
  medicationName,
}: TreatmentControlProps) {
  return (
    <>
      <View className="p-2 flex flex-col gap-2 flex-shrink-0">
        <View className="flex flex-row items-center justify-between">
          <Text className="text-2xl text-[#13203F] font-bold">
            Controle de tratamento
          </Text>
        </View>
        {medicationName ? (
          <Text className="text-sm font-semibold text-[#179A9B] uppercase tracking-wider">
            {medicationName}
          </Text>
        ) : null}
      </View>

      <ScrollView>
        <View className="p-2 gap-4">
          {items.length === 0 ? (
            <Text className="text-gray-500 text-center italic mt-4">
              Nenhum registro neste mês.
            </Text>
          ) : (
            items.map((item) => (
              <TreatmentDetail
                key={item.id}
                date={item.date}
                time={item.time}
                meridiem={item.meridiem}
              />
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}
