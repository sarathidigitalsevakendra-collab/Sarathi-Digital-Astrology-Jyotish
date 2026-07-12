export interface ConsultationSlot {
  id: string;
  astrologerId: string;
  startTime: string;
  endTime: string;
  mode: "chat" | "voice" | "video";
}

const MOCK_SLOTS: ConsultationSlot[] = [
  {
    id: "SLOT-1",
    astrologerId: "astro-aarti",
    startTime: "2024-05-12T14:00:00+05:30",
    endTime: "2024-05-12T14:30:00+05:30",
    mode: "video",
  },
];

export class ConsultationScheduler {
  listSlots(astrologerId: string) {
    return MOCK_SLOTS.filter((slot) => slot.astrologerId === astrologerId);
  }
}
