import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { ptBRLocale } from "@/lib/locale";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
  Calendar,
  CalendarProps,
  DateData,
  LocaleConfig,
} from "react-native-calendars";

LocaleConfig.locales["pt"] = ptBRLocale;
LocaleConfig.defaultLocale = "pt";

interface StyledCalendarProps extends Omit<CalendarProps, "theme"> {
  onDayPress?: (day: DateData) => void;
  onMonthChange?: (month: DateData) => void;
  markedDates?: CalendarProps["markedDates"];
  className?: string;
}

// Theme colors matching your app design
const CALENDAR_THEME = {
  backgroundColor: "#ffffff",
  calendarBackground: "#ffffff",
  textSectionTitleColor: "#13203F",
  selectedDayBackgroundColor: "#179A9B",
  selectedDayTextColor: "#ffffff",
  todayTextColor: "#179A9B",
  dayTextColor: "#13203F",
  textDisabledColor: "#d9e1e8",
  dotColor: "#179A9B",
  selectedDotColor: "#ffffff",
  arrowColor: "#179A9B",
  monthTextColor: "#13203F",
  indicatorColor: "#179A9B",
  textDayFontWeight: "400" as const,
  textMonthFontWeight: "700" as const,
  textDayHeaderFontWeight: "500" as const,
  textDayFontSize: 16,
  textMonthFontSize: 48,
  textDayHeaderFontSize: 13,
};

export default function StyledCalendar({
  onDayPress,
  onMonthChange,
  markedDates,
  className,
  ...props
}: StyledCalendarProps) {
  const CustomDay = ({
    date,
    state,
    marking,
  }: {
    date?: DateData;
    state?: string;
    marking?: any;
  }) => {
    if (!date) return <View />;

    const isSelected = marking?.selected;
    const isToday = state === "today";
    const isDisabled = state === "disabled";

    const containerStyle = isSelected
      ? "bg-[#179A9B] rounded-full w-[32px] h-[32px] items-center justify-center"
      : "w-[32px] h-[32px] items-center justify-center";

    const textStyle = isSelected
      ? "text-white font-medium"
      : isToday
        ? "text-[#179A9B] font-medium"
        : isDisabled
          ? "text-gray-300"
          : "text-[#13203F]";

    return (
      <Popover>
        <PopoverTrigger asChild>
          <TouchableOpacity className={containerStyle} activeOpacity={0.7}>
            <Text className={textStyle}>{date.day}</Text>
          </TouchableOpacity>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4">
          <PopoverClose asChild>
            <TouchableOpacity
              onPress={() => {
                console.log("Marking day:", date.dateString);
                onDayPress?.(date);
              }}
            >
              <Text className="text-popover-foreground ">
                {isSelected ? "Desmarcar" : "Marcar como tomado"}
              </Text>
            </TouchableOpacity>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <View className={className || "bg-white"}>
      <Calendar
        dayComponent={CustomDay}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        monthFormat="MMMM"
        theme={CALENDAR_THEME}
        headerStyle={{}}
        style={{
          borderWidth: 0,
        }}
        {...props}
      />
    </View>
  );
}
