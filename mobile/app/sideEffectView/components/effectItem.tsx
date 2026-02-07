import { MOODS } from "@/constants/moods";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  Image,
  TouchableOpacity,
  View,
  Switch,
  ImageSourcePropType,
} from "react-native";

interface EffectProps {
  id: string;
  text: string;
  description: string;
  image?: ImageSourcePropType;
  notes: string;
  onChangeNotes: (value: string) => void;
  mood?: number;
  onMoodChange?: (value: number) => void;
  anxiety?: boolean;
  onAnxietyChange?: (value: boolean) => void;
  focus?: number;
  onFocusChange?: (value: number) => void;
}

const EffectItem = ({
  id,
  text,
  description,
  image,
  notes,
  onChangeNotes,
  mood,
  onMoodChange,
  anxiety,
  onAnxietyChange,
  focus,
  onFocusChange,
}: EffectProps) => {
  return (
    <AccordionItem value={id} className="w-full max-w-lg mb-2">
      <AccordionTrigger className="flex flex-row items-center justify-start gap-2">
        <Image
          className="w-12 h-12 justify-start rounded-full"
          source={image}
        />
        <Text className="justify-start text-lg font-semibold">{text} </Text>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance justify-start">
        <Text>{description}</Text>

        {id === "type-1" && (
          <View>
            <Text className="text-base font-bold mb-2">
              Como está seu humor?
            </Text>
            <View className="flex-row justify-between">
              {MOODS.map((m) => (
                <Tooltip key={m.value} delayDuration={150}>
                  <TooltipTrigger asChild>
                    <TouchableOpacity
                      onPress={() => onMoodChange?.(m.value)}
                      className={`p-2 rounded-full ${
                        mood === m.value ? "bg-gray-200" : ""
                      }`}
                    >
                      <Text className="text-2xl">{m.label}</Text>
                    </TouchableOpacity>
                  </TooltipTrigger>
                  <TooltipContent className="w-auto p-2 bg-primary">
                    <Text className="text-sm font-semibold text-primary-foreground">
                      {m.description}
                    </Text>
                  </TooltipContent>
                </Tooltip>
              ))}
            </View>

            <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl mt-4">
              <Text className="font-semibold text-base">Sentiu ansiedade?</Text>
              <Switch
                value={anxiety}
                onValueChange={onAnxietyChange}
                trackColor={{ false: "#767577", true: "#179A9B" }}
                thumbColor={anxiety ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        )}

        {id === "type-2" && (
          <View>
            <Text className="text-base font-bold mb-2">
              Nível de Foco (1-5)
            </Text>
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => onFocusChange?.(val)}
                  className={`w-10 h-10 items-center justify-center rounded-full border ${
                    focus === val
                      ? "bg-[#179A9B] border-[#179A9B]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`${
                      focus === val ? "text-white" : "text-gray-700"
                    } font-bold`}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text className="text-base font-bold">Anotações:</Text>
        <Input
          placeholder="Anotações"
          value={notes}
          onChangeText={onChangeNotes}
          className="text-base"
          containerClassName="flex-1"
        />
      </AccordionContent>
    </AccordionItem>
  );
};

export default EffectItem;
