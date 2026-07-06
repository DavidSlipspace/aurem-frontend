export type Trip = {
  id: string;
  tripReferenceId: string;
  caseReferenceId: string;
  gcName: string;
  tripPurpose: string;
  status: string;
  outboundDate: string;
  returnDate: string;
  outboundAirport: string;
  returnAirport: string;
  destinationCity?: string | null;
  destinationAddress?: string | null;
  hotelProximityPreference?: string | null;
  minimumHotelStarRating?: number | null;
  budgetFilter: number;
  companionTraveler: boolean;
};

export type TripsResponse = {
  trips: Trip[];
};