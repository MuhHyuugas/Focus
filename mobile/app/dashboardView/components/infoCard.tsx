import { Text } from "@/components/ui/text";
import { View } from "react-native";

interface InfoCardProps {
  info: string;
  description: string;
}

export default function InfoCard({ info, description }: InfoCardProps) {
  return (
    <View className="flex-1 items-center justify-center rounded-xl bg-slate-900 p-2">
      <Text className="text-2xl font-bold text-white">{info}</Text>

      <Text className="text-center text-slate-400">{description}</Text>
    </View>
  );
}
