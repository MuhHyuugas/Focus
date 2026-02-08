import { ReportRepository } from "../repositories/ReportRepository";

export class SyncDailyMarks {
    constructor(private repository: ReportRepository) { }

    async execute(): Promise<void> {
        await this.repository.syncData();
    }
}
