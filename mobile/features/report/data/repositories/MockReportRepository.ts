import { MOCK_MARKED_DATES } from "@/data/mock/database";
import { CalendarProps } from "react-native-calendars";
import { ReportRepository } from "../../domain/repositories/ReportRepository";

export class MockReportRepository implements ReportRepository {
  private markedDates: CalendarProps["markedDates"] = { ...MOCK_MARKED_DATES };

  async getMarkedDates(): Promise<CalendarProps["markedDates"]> {
    return Promise.resolve(this.markedDates);
  }

  async saveMarkedDates(dates: CalendarProps["markedDates"]): Promise<void> {
    this.markedDates = dates;
    return Promise.resolve();
  }

  /*
   * For the mock implementation, syncData just "pretends" to sync.
   */
  async syncData(): Promise<void> {
    console.log("Mock syncing data...");
    return Promise.resolve();
  }

  async clearData(): Promise<void> {
    this.markedDates = {};
    return Promise.resolve();
  }
}
