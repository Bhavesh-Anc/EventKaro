// Plain (non-"use server") module so the settings shape + defaults can be
// imported by both server actions and client components.

export interface WeddingSettings {
  total_budget_inr: number;
  catering_per_head_inr: number;
  room_per_night_inr: number;
  transport_per_seat_inr: number;
  rsvp_cutoff_date?: string;
}

export const DEFAULT_WEDDING_SETTINGS: WeddingSettings = {
  total_budget_inr: 4200000,
  catering_per_head_inr: 1500,
  room_per_night_inr: 4000,
  transport_per_seat_inr: 500,
  rsvp_cutoff_date: undefined,
};
