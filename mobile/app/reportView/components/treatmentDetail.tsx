import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface TreatmentDetailProps {
  date: string;
  time: string;
  meridiem: number;
}
export default function TreatmentDetail({
  date,
  time,
  meridiem,
}: TreatmentDetailProps) {
  return (
    <View className="flex flex-row items-center justify-between py-2 border-b border-gray-100">
      <View className="flex flex-row gap-4 items-center">
        <View className="w-2 h-2 rounded-full bg-[#13203F]" />
        <Text className="text-lg text-[#13203F]">{date}</Text>
      </View>
      <View className="flex flex-row justify-start gap-1 items-baseline">
        <Text className="text-xl font-bold text-[#13203F]">{time}</Text>
        <Text className="text-sm text-gray-500">
          {meridiem === 1 ? "AM" : "PM"}
        </Text>
      </View>
    </View>
  );
}
