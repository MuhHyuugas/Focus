import { useCallback, useMemo, useState } from "react";
import { CalendarProps, DateData } from "react-native-calendars";
import { ReportRepositoryImpl } from "../../data/repositories/ReportRepositoryImpl";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { useFocusEffect } from "expo-router";

const repository = new ReportRepositoryImpl();
const medRepository = new MedicationRepositoryImpl();

export interface HistoryItem {
  id: string;
  medicationName: string;
  date: string;
  time: string;
  meridiem: number;
}

// funcao que define o viewmodel do relatorio
export function useReportViewModel() {
  const [activeTab, setActiveTab] = useState<"month" | "year">("month"); // define a aba ativa
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // define a data atual

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // define o ano atual
  const currentYear = useMemo(() => {
    if (!currentDate) return new Date().getFullYear().toString();
    return currentDate.split("-")[0];
  }, [currentDate]);

  const [markedDates, setMarkedDates] = useState<CalendarProps["markedDates"]>(
    {},
  ); // define as datas marcadas

  // funcao que carrega as datas marcadas
  const loadMarkedDates = useCallback(async () => {
    const dates = await repository.getMarkedDates();
    setMarkedDates(dates);
  }, []);

  const loadHistory = useCallback(async () => {
    const doses = await medRepository.getAllTakenDoses();
    const medications = await medRepository.getMedications();

    const [year, month] = currentDate.split("-");
    const targetPrefix = `${year}-${month}`;

    const filteredDoses = doses.filter((d) => d.date.startsWith(targetPrefix));

    // Sort filteredDoses first.
    filteredDoses.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });

    // Re-map sorted
    const sortedItems = filteredDoses.map((dose, index) => {
      const med = medications.find((m) => m.id === dose.medId);
      const [hourStr] = dose.time.split(":");
      const hour = parseInt(hourStr);
      const isPm = hour >= 12;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const [, month, day] = dose.date.split("-");

      return {
        id: `${dose.date}-${dose.time}-${index}`,
        medicationName: med ? med.name : "Desconhecido",
        date: `${day}.${month}`,
        time: displayHour.toString(),
        meridiem: isPm ? 2 : 1,
      };
    });

    setHistoryItems(sortedItems);
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      loadMarkedDates();
      loadHistory();
    }, [loadMarkedDates, loadHistory]),
  );

  // funcao que define a mudança de mes do calendario
  const handleMonthChange = useCallback((month: DateData) => {
    setCurrentDate(month.dateString);
  }, []);

  // funcao que define a selecao de mes do calendario
  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      const year = parseInt(currentYear);

      const month = (monthIndex + 1).toString().padStart(2, "0");
      const newDate = `${year}-${month}-01`;

      setCurrentDate(newDate);
      setActiveTab("month");
    },
    [currentYear],
  );

  // funcao que define a selecao de dia do calendario
  const handleDayPress = useCallback((day: DateData) => {
    setMarkedDates((prev: CalendarProps["markedDates"]) => {
      const isSelected = prev?.[day.dateString]?.selected;
      const newMarkedDates = { ...prev };

      if (isSelected) {
        delete newMarkedDates[day.dateString];
      } else {
        newMarkedDates[day.dateString] = {
          selected: true,
          marked: true,
          selectedColor: "#179A9B",
        };
      }

      // Salva as datas marcadas
      repository.saveMarkedDates(newMarkedDates);

      return newMarkedDates;
    });
  }, []);

  // funcao que define a mudança de aba
  const handleTabChange = (value: string) => {
    if (value === "month" || value === "year") {
      setActiveTab(value);
    }
  };

  // funcao que define as opcoes da tela do calendario
  const screenOptions = useMemo(
    () => ({
      title: currentYear,
      headerShown: true,
      headerBackTitle: "Voltar",
      headerTintColor: "#13203F",
      headerTitleStyle: {
        fontWeight: "600" as const,
      },
      headerStyle: {
        backgroundColor: "#ffffff",
      },
    }),
    [currentYear],
  );

  return {
    activeTab,
    handleTabChange,
    currentDate,
    setCurrentDate,
    currentYear,
    handleMonthChange,
    handleMonthSelect,
    handleDayPress,
    markedDates,
    screenOptions,
    historyItems,
  };
}
