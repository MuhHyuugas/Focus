import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useReportViewModel } from "@/features/report/presentation/viewmodels/useReportViewModel";

import { ScrollView, View } from "react-native";
import StyledCalendar from "./components/calendar";
import TreatmentControl from "./components/treatmentControl";
import YearOverview from "./components/yearOverview";

export default function ReportView() {
  const {
    activeTab,
    handleTabChange,
    handleMonthChange,
    handleDayPress,
    handleMonthSelect,

    markedDates,
    currentDate,
    setCurrentDate,
    currentYear,
    historyItems,
    activeMedicationName,
  } = useReportViewModel();

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 flex-col gap-6 p-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="month">
                <Text>Mês</Text>
              </TabsTrigger>
              <TabsTrigger value="year">
                <Text>Ano</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="month">
              <View>
                <StyledCalendar
                  current={currentDate}
                  onDayPress={handleDayPress}
                  onMonthChange={handleMonthChange}
                  markedDates={markedDates}
                />

                <View className="pt-4">
                  <Separator />
                  <TreatmentControl
                    items={historyItems}
                    medicationName={activeMedicationName}
                  />
                </View>
              </View>
            </TabsContent>

            <TabsContent value="year">
              <YearOverview
                currentYear={currentYear}
                markedDates={markedDates}
                onMonthSelect={handleMonthSelect}
                onYearChange={(year) => {
                  const newDate = `${year}-${currentDate.split("-")[1]}-${currentDate.split("-")[2]}`;
                  setCurrentDate(newDate);
                }}
              />
            </TabsContent>
          </Tabs>
        </View>
      </ScrollView>
    </>
  );
}

/*
 * A visão anual, mostra todos os meses do ano?
 * A lupa, é para pesquisar o que?
 */
