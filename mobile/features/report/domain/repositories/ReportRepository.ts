import { CalendarProps } from "react-native-calendars";

export interface ReportRepository {
  getMarkedDates(): Promise<CalendarProps["markedDates"]>;
  getMarkedDatesArray(): Promise<string[]>;
  toggleMarkedDate(date: string): Promise<void>;
  syncData(): Promise<void>;
  clearData(): Promise<void>;
}
