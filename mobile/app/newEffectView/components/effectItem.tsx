import { images } from "@/assets/assets";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Image } from "react-native";

interface EffectProps {
  id: string;
  text: string;
  description: string;
  image?: string;
  notes: string;
  onChangeNotes: (value: string) => void;
}

const EffectItem = ({
  id,
  text,
  description,
  image,
  notes,
  onChangeNotes,
}: EffectProps) => {
  return (
    <AccordionItem value={id} className="w-full max-w-lg mb-2">
      <AccordionTrigger className="flex flex-row items-center justify-start gap-2">
        <Image
          className="w-12 h-12 justify-start"
          source={image ? image : images.profilePic}
        />
        <Text className="justify-start text-lg font-semibold">{text}</Text>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 text-balance justify-start">
        <Text>{description}</Text>
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
