import { MedicationRepository } from "@/features/meds/domain/repositories/MedicationRepository";

export class SearchMedications {
  constructor(private medicationRepository: MedicationRepository) {}

  async execute(
    query: string,
  ): Promise<{ id: string; name: string; defaultDosage: string }[]> {
    if (!query || query.length <= 1) {
      return [];
    }
    return await this.medicationRepository.searchCatalog(query);
  }
}
