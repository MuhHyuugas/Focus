import { ReportRepository } from "../repositories/ReportRepository";
import { CalendarProps } from "react-native-calendars";

export class GetMarkedDates {
  constructor(private reportRepository: ReportRepository) {}

  async execute(): Promise<CalendarProps["markedDates"]> {
    return await this.reportRepository.getMarkedDates();
  }
}
