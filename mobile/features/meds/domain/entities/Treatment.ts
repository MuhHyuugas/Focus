export interface Treatment {
  id: string; // UUID
  userId: string; // UUID
  medicationId: string; // UUID
  
  dose: string; // ex: "10mg"
  days: string[]; // JSON parsed: ["seg", "ter"]
  times: string[]; // JSON parsed: ["08:00"]
  
  createdAt: number; // Epoch MS
  updatedAt: number; // Epoch MS
}