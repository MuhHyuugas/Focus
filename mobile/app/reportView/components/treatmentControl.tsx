import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { HistoryItem } from "@/features/report/presentation/viewmodels/useReportViewModel";
import { AlarmClock, Calendar1 } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import TreatmentDetail from "./treatmentDetail";

interface TreatmentControlProps {
  items: HistoryItem[];
}

export default function TreatmentControl({ items }: TreatmentControlProps) {
  return (
    <>
      <View className=" p-2 flex flex-row items-center justify-between gap-2 flex-shrink-0">
        <Text className="text-2xl text-[#13203F] font-bold">
          Controle de tratamento
        </Text>
        <View className="flex flex-row gap-4">
          <Icon as={Calendar1} color="#13203F" size={36} />
          <Icon as={AlarmClock} size={36} />
        </View>
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
                medicationName={item.medicationName}
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
