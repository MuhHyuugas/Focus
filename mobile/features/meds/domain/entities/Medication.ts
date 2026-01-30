// interface que define a estrutura de um medicamento
export interface Medication {
  id: string;
  name: string;
  days: string[];
  times: string[];
  image?: any;
}
