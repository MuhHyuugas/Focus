import { Text } from "@/components/ui/text";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { CalendarProps } from "react-native-calendars";

interface YearOverviewProps {
  currentYear: string;
  markedDates?: CalendarProps["markedDates"];
  onMonthSelect: (monthIndex: number) => void;
  onYearChange: (year: number) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export default function YearOverview({
  currentYear,
  markedDates,
  onMonthSelect,
  onYearChange,
}: YearOverviewProps) {
  const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getMarkedDaysCount = (monthIndex: number, year: number) => {
    if (!markedDates) return 0;

    let count = 0;
    const daysInMonth = getDaysInMonth(monthIndex, year);

    const monthStr = (monthIndex + 1).toString().padStart(2, "0");

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, "0");
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      if (markedDates[dateStr]?.selected) {
        count++;
      }
    }

    return count;
  };

  const renderMiniMonth = (monthIndex: number) => {
    const year = parseInt(currentYear);
    const date = new Date(year, monthIndex, 1);
    const monthName = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
    }).format(date);
    const capitalizedMonth =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const daysInMonth = getDaysInMonth(monthIndex, year);
    const markedCount = getMarkedDaysCount(monthIndex, year);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <TouchableOpacity
        key={monthIndex}
        className="w-[45%] mb-8 items-center"
        onPress={() => onMonthSelect(monthIndex)}
      >
        <Text className="font-semibold mb-3 text-base">{capitalizedMonth}</Text>
        <View className="flex-row flex-wrap w-full justify-center gap-[4px]">
          {days.map((day) => {
            const monthStr = (monthIndex + 1).toString().padStart(2, "0");
            const dayStr = day.toString().padStart(2, "0");
            const dateStr = `${year}-${monthStr}-${dayStr}`;
            const isMarked = markedDates?.[dateStr]?.selected;

            return (
              <View
                key={day}
                className={`w-[8px] h-[8px] rounded-full ${isMarked ? "bg-[#179A9B]" : "bg-gray-200"}`}
              />
            );
          })}
        </View>

        <Text className="text-xs text-muted-foreground mt-2">
          {markedCount} / {daysInMonth}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => onYearChange(parseInt(currentYear) - 1)}
          className="p-2"
        >
          <ChevronLeft size={24} color="#13203F" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-[#13203F]">{currentYear}</Text>

        <TouchableOpacity
          onPress={() => onYearChange(parseInt(currentYear) + 1)}
          className="p-2"
        >
          <ChevronRight size={24} color="#13203F" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-2">
        <View className="flex-row flex-wrap justify-between px-4 pb-8">
          {MONTHS.map((monthIndex) => renderMiniMonth(monthIndex))}
        </View>
      </ScrollView>
    </View>
  );
}
