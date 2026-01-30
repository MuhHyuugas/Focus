import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DaySelectorProps {
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

const DAYS = [
  { id: "dom", label: "D", fullName: "Domingo" },
  { id: "seg", label: "S", fullName: "Segunda-feira" },
  { id: "ter", label: "T", fullName: "Terça-feira" },
  { id: "qua", label: "Q", fullName: "Quarta-feira" },
  { id: "qui", label: "Q", fullName: "Quinta-feira" },
  { id: "sex", label: "S", fullName: "Sexta-feira" },
  { id: "sab", label: "S", fullName: "Sábado" },
];

const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
}) => {
  return (
    <View className="flex-row flex-1 justify-start gap-2 p-4 flex-wrap">
      {DAYS.map((day) => {
        const isSelected = selectedDays.includes(day.id);
        return (
          <Tooltip key={day.id} delayDuration={150}>
            <TooltipTrigger asChild>
              <Badge
                asChild
                variant={isSelected ? "default" : "secondary"}
                className={`h-12 w-12 items-center justify-center rounded-full border-0 ${
                  isSelected ? "bg-[#179A9B]" : "bg-neutral-200"
                }`}
              >
                <TouchableOpacity onPress={() => onToggleDay(day.id)}>
                  <Text
                    className={`text-base font-semibold ${
                      isSelected ? "text-white" : "text-neutral-600"
                    }`}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="w-auto p-2 bg-primary">
              <Text className="text-sm font-semibold text-primary-foreground">
                {day.fullName}
              </Text>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </View>
  );
};

export default DaySelector;
