export interface Notification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: "medication_reminder" | "system";
  data?: {
    medicationId?: string;
    doseTime?: string;
  };
}
