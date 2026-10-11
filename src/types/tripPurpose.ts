export const TripPurpose = {
  Monitoring: "Monitoring",
  Transfer: "Transfer",
  Delivery: "Delivery",
  Consultation: "Consultation",
  Legal: "Legal",
  Other: "Other"
} as const;

export type TripPurpose =
  (typeof TripPurpose)[keyof typeof TripPurpose];