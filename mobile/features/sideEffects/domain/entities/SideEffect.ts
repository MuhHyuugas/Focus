export interface SideEffect {
  id: string;
  medicationId: string;
  typeId: string;
  description: string;
  notes: string;
  date: string; // ISO Date String
  mood?: number;
  anxiety?: boolean;
  focus?: number;
}
