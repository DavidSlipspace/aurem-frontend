export const SeatPreference = {
  Window: "Window",
  Aisle: "Aisle",
  Middle: "Middle",
  NoPreference: "No preference"
} as const;

export type SeatPreference =
  (typeof SeatPreference)[keyof typeof SeatPreference];