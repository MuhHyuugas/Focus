import { images } from "@/assets/assets";
import { User } from "@/features/auth/domain/entities/User";
import { Medication } from "@/features/meds/domain/entities/Medication";
import { SideEffect } from "@/features/sideEffects/domain/entities/SideEffect";
import { CalendarProps } from "react-native-calendars";

// --- Mock Users ---
export const MOCK_USERS: User[] = [
  {
    id: "user-123",
    name: "Carlo",
    email: "carlo@focus.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    password: "123",
    profilePicture: images.profilePic,
  },
  {
    id: "user-124",
    name: "Maria",
    email: "maria@focus.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    password: "123",
    profilePicture: images.profilePic, // Assuming images.profilePic is available
  },
];

// --- Mock Medications ---
// List of available medications for search suggestions
// List of available medications for search suggestions
export const MOCK_AVAILABLE_MEDICATIONS = [
  { name: "Ritalina (Metilfenidato)", defaultDosage: "10mg" },
  { name: "Concerta", defaultDosage: "18mg" },
  { name: "Venvanse (Lisdexanfetamina)", defaultDosage: "30mg" },
  { name: "Stavigile (Modafinila)", defaultDosage: "100mg" },
  { name: "Atentah (Atomoxetina)", defaultDosage: "40mg" },
  { name: "Ritalina LA", defaultDosage: "20mg" },
  { name: "Metilfenidato Genérico", defaultDosage: "10mg" },
  { name: "Consiv", defaultDosage: "36mg" },
  { name: "Juneve", defaultDosage: "30mg" },
];

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "med-1",
    name: "Venvanse 30mg",
    days: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
    times: ["08:00"],
    image: images.medshield,
  },
  {
    id: "med-2",
    name: "Ritalina 10mg",
    days: ["seg", "ter", "qua", "qui", "sex"],
    times: ["08:00", "13:00"],
    image: images.medshield,
  },
];

// --- Mock Side Effect Types ---
export const MOCK_SIDE_EFFECT_TYPES = [
  {
    id: "type-1",
    name: "Alterações de humor",
    description: "Mudanças repentinas de humor, irritabilidade ou ansiedade.",
  },
  {
    id: "type-2",
    name: "Alterações no foco",
    description: "Dificuldade de concentração ou hiperfoco.",
  },
  {
    id: "type-3",
    name: "Efeitos físicos",
    description: "Tontura, enjoo, dor de cabeça ou palpitações.",
  },
  {
    id: "type-4",
    name: "Alterações no sono",
    description: "Insônia, sonolência excessiva ou pesadelos.",
  },
  {
    id: "type-5",
    name: "Outros",
    description: "Outros efeitos não listados acima.",
  },
];

// --- Mock Side Effects ---
export const MOCK_SIDE_EFFECTS: SideEffect[] = [
  {
    id: "side-effect-1",
    medicationId: "med-1",
    description: "Efeitos físicos",
    notes: "Dor de cabeça leve. Ocorreu após a dose da manhã.",
    date: "2023-10-27T10:00:00.000Z",
  },
  {
    id: "side-effect-2",
    medicationId: "med-2",
    description: "Efeitos físicos",
    notes: "Náusea. Passou rápido.",
    date: "2023-10-28T14:00:00.000Z",
  },
];

// --- Mock Reports (Marked Dates) ---
export const MOCK_MARKED_DATES: CalendarProps["markedDates"] = {
  "2023-10-25": {
    selected: true,
    marked: true,
    dotColor: "#179A9B",
    selectedColor: "#179A9B",
  },
  "2023-10-26": {
    selected: true,
    marked: true,
    dotColor: "#179A9B",
    selectedColor: "#179A9B",
  },
  // Add more dates as needed for testing
};
