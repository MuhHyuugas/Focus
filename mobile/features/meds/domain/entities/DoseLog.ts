export interface DoseLog {
  id: string; // UUID
  treatmentId: string; // UUID (FK)
  
  scheduledTime: string; // ISO Date String
  takenTime: string; // ISO Date String
  
  // Sintomas
  mood?: number; // Código do humor
  anxiety?: boolean;
  focus?: number; // 1-5
  notes?: string;
  
  createdAt: number; // Epoch MS
  updatedAt: number; // Epoch MS
}