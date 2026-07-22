export type Trip = {
  id: string;
  tripReferenceId: string;

  caseId: string;
  caseReferenceId: string;

  gcProfileId: string;
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
  ipcmApprovalRequired: boolean;
};

export type TripsResponse = {
  trips: Trip[];
};

export type TripRequest = {
  caseId: string;
  gcProfileId: string;
  tripPurpose: string;

  outboundDate: string;
  returnDate: string;
  outboundAirport: string;
  returnAirport: string;

  destinationCity?: string;
  destinationAddress?: string;
  hotelProximityPreference?: string;
  minimumHotelStarRating?: number;

  budgetFilter: number;
  companionTraveler: boolean;
  ipcmApprovalRequired: boolean;

  status?: string;
};