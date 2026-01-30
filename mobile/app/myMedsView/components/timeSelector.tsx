import { Badge } from "@/components/ui/badge";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TimeSelectorProps {
  times: string[];
  onAddTime: (time: string) => void;
  onRemoveTime: (time: string) => void;
  formatTime?: (time: string) => string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  times,
  onAddTime,
  onRemoveTime,
  formatTime,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      onAddTime(`${hours}:${minutes}`);
    }
  };

  return (
    <View className="gap-2 p-2">
      <View className="flex-row flex-wrap gap-2">
        {times.map((time) => (
          <Badge
            key={time}
            className="flex-row items-center gap-1 bg-[#179A9B] rounded-full px-4 py-2 border-0"
          >
            <TouchableOpacity
              onPress={() => onRemoveTime(time)}
              className="flex-row items-center gap-1"
            >
              <Text className="text-white font-semibold mr-1">
                {formatTime ? formatTime(time) : time}
              </Text>
              <X size={14} color="white" />
            </TouchableOpacity>
          </Badge>
        ))}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="flex-row items-center border border-[#179A9B] rounded-full px-4 py-2"
        >
          <Text className="text-[#179A9B] font-semibold mr-1">Adicionar</Text>
          <Plus size={14} color="#179A9B" />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onChange}
          accentColor="#179A9B"
        />
      )}
    </View>
  );
};

export default TimeSelector;
