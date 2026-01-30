import { Text } from "@/components/ui/text";
import { ImageBackground, ImageSourcePropType, View } from "react-native";

interface DashCardProps {
  title: string;
  counter?: number | string;
  counterDescription?: string;
  backgroundImage: ImageSourcePropType;
}

export default function DashCard({
  title,
  counter,
  counterDescription,
  backgroundImage,
}: DashCardProps) {
  return (
    <View className="m-2 w-[40vw] aspect-square">
      <View className="flex-1 w-full overflow-hidden rounded-[24px] bg-[#179A9B] shadow-sm">
        <ImageBackground
          source={backgroundImage}
          className="flex-1 justify-between p-4"
          imageStyle={{ opacity: 0.6 }}
          resizeMode="cover"
        >
          <Text className="text-lg font-medium text-white/90 leading-tight">
            {title}
          </Text>
          <View>
            <View className="flex items-start gap-1">
              <Text className="text-4xl font-bold text-white tracking-tighter shadow-black/50">
                {counter}
              </Text>
              <Text className="text-lg font-medium text-white/80 mb-1.5">
                {counterDescription}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}
