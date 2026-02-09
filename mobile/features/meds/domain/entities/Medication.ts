// interface que define a estrutura de um medicamento
export interface Medication {
  id: string;
  name: string;
  days: string[];
  times: string[];
  status?: string;
  dosage?: string;
  image?: any;
}
