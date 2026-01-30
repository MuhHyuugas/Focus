import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface TreatmentDetailProps {
  medicationName: string;
  date: string;
  time: string;
  meridiem: number;
}
export default function TreatmentDetail({
  medicationName,
  date,
  time,
  meridiem,
}: TreatmentDetailProps) {
  return (
    <View className="flex flex-row items-center justify-between">
      <Text className="text-xl bold">{medicationName}</Text>
      <View className="flex flex-row gap-12">
        <Text className="text-xl">{date}</Text>
        <View className="flex flex-row justify-start gap-1">
          <Text className="text-xl">{time}</Text>
          <Text className="text-xs">{meridiem === 1 ? "am" : "pm"}</Text>
        </View>
      </View>
    </View>
  );
}
