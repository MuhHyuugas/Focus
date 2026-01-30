import { CalendarProps } from "react-native-calendars";

export interface ReportRepository {
  getMarkedDates(): Promise<CalendarProps["markedDates"]>;
  saveMarkedDates(dates: CalendarProps["markedDates"]): Promise<void>;
  syncData(): Promise<void>;
  clearData(): Promise<void>;
}
