import { useCallback, useMemo, useState } from "react";
import { CalendarProps, DateData } from "react-native-calendars";
import { ReportRepositoryImpl } from "../../data/repositories/ReportRepositoryImpl";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { useFocusEffect } from "expo-router";
import { GetMarkedDates } from "../../domain/usecases/GetMarkedDates";
import { GetMonthlyReport } from "../../domain/usecases/GetMonthlyReport";
import { HistoryItem } from "../../domain/entities/HistoryItem";

import { ToggleMarkedDate } from "../../domain/usecases/ToggleMarkedDate";
import { SyncDailyMarks } from "../../domain/usecases/SyncDailyMarks";

const repository = new ReportRepositoryImpl();
const medRepository = new MedicationRepositoryImpl();

const getMarkedDatesUseCase = new GetMarkedDates(repository);
const getMonthlyReportUseCase = new GetMonthlyReport(medRepository);
const toggleMarkedDateUseCase = new ToggleMarkedDate(repository);
const syncDailyMarksUseCase = new SyncDailyMarks(repository);

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
    // Background sync before loading locals to ensure fresh data
    syncDailyMarksUseCase.execute().catch(console.error);

    const dates = await getMarkedDatesUseCase.execute();
    setMarkedDates(dates);
  }, []);

  const loadHistory = useCallback(async () => {
    const [year, month] = currentDate.split("-");
    const items = await getMonthlyReportUseCase.execute(year, month);
    setHistoryItems(items);
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
  const handleDayPress = useCallback(
    async (day: DateData) => {
      try {
        await toggleMarkedDateUseCase.execute(day.dateString);
        await loadMarkedDates(); // Refresh markers
      } catch (error) {
        console.error("Error toggling date:", error);
      }
    },
    [loadMarkedDates],
  );

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
