export type SelectedTripFlight = {
  offerId: string;

  airline:
    | string
    | null;

  originAirport:
    | string
    | null;

  destinationAirport:
    | string
    | null;

  returnOriginAirport:
    | string
    | null;

  returnDestinationAirport:
    | string
    | null;

  outboundDepartureAt:
    | string
    | null;

  returnDepartureAt:
    | string
    | null;

  price: number;

  currency: string;

  approvalStatus:
    | string
    | null;

  bookingStatus:
    | string
    | null;
};

export type SelectedTripHotel = {
  offerId: string;

  name:
    | string
    | null;

  address:
    | string
    | null;

  checkInDate:
    | string
    | null;

  checkOutDate:
    | string
    | null;

  price: number;

  currency: string;

  approvalStatus:
    | string
    | null;

  bookingStatus:
    | string
    | null;
};

export type Trip = {
  id: string;

  tripReferenceId:
    string;

  caseId:
    string;

  caseReferenceId:
    string;

  travelerProfileId:
    string;

  travelerName:
    string;

  travelerEmail:
    string;

  ipcmUserId:
    string;

  ipcmName:
    string;

  tripPurpose:
    string;

  status:
    string;

  outboundDate:
    string;

  returnDate:
    string;

  outboundAirport:
    string;

  returnAirport:
    string;

  destinationCity?:
    | string
    | null;

  destinationAddress?:
    | string
    | null;

  hotelProximityPreference?:
    | string
    | null;

  minimumHotelStarRating?:
    | number
    | null;

  budgetFilter:
    number;

  companionTraveler:
    boolean;

  ipcmApprovalRequired:
    boolean;

  bookingLinkExpiresAt?:
    | string
    | null;

  selectedFlight?:
    | SelectedTripFlight
    | null;

  selectedHotel?:
    | SelectedTripHotel
    | null;
};

export type TripsResponse = {
  trips:
    Trip[];
};

export type TripRequest = {
  caseId:
    string;

  travelerProfileId:
    string;

  ipcmUserId:
    string;

  tripPurpose:
    string;

  outboundDate:
    string;

  returnDate:
    string;

  outboundAirport:
    string;

  returnAirport:
    string;

  destinationCity?:
    string;

  destinationAddress?:
    string;

  hotelProximityPreference?:
    string;

  minimumHotelStarRating?:
    number;

  budgetFilter:
    number;

  companionTraveler:
    boolean;

  ipcmApprovalRequired:
    boolean;

  status?:
    string;
};

export type SendTripToTravelerResponse = {
  message:
    string;

  tripId:
    string;

  status:
    string;

  sentTo:
    string;

  expiresAt:
    string;
};