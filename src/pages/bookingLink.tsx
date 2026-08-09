import {
  useEffect,
  useState
} from "react";

import "./bookingLink.css";

type BookingLinkPageProps = {
  token: string;
};

type BookingLinkResponse = {
  bookingLinkId: string;
  tripId: string;
  tripReferenceId: string;
  gcName: string;
  expiresAt: string;
};

type HotelOption = {
  searchResultId: string;
  accommodationId: string;

  name: string;
  description: string | null;

  address: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;

  latitude: number | null;
  longitude: number | null;

  distanceFromDestinationMiles:
    | number
    | null;

  starRating: number | null;
  reviewScore: number | null;
  reviewCount: number | null;

  cheapestTotalAmountCents: number;
  currency: string;

  photoUrl: string | null;
  amenities: string[];

  loyaltyProgram: string | null;
  expiresAt: string | null;

  isWithinBudget: boolean;
};

type HotelSearchResponse = {
  tripReferenceId: string;
  gcName: string;

  destination: string;
  checkInDate: string;
  checkOutDate: string;

  adultGuests: number;
  rooms: number;

  radiusKilometers: number;

  minimumStarRating:
    | number
    | null;

  totalTripBudgetCents: number;
  hotelBudgetCents: number;

  currency: string;

  hotels: HotelOption[];
};

type FlightSegment = {
  id: string;

  originAirportCode: string;
  originAirportName: string;

  destinationAirportCode: string;
  destinationAirportName: string;

  departingAt: string;
  arrivingAt: string;

  durationMinutes: number | null;

  marketingCarrierName: string;
  marketingCarrierCode: string | null;

  operatingCarrierName: string;
  operatingCarrierCode: string | null;

  flightNumber: string;

  aircraftName: string | null;
};

type FlightJourney = {
  originAirportCode: string;
  destinationAirportCode: string;

  departingAt: string;
  arrivingAt: string;

  durationMinutes: number | null;

  stopCount: number;

  segments: FlightSegment[];
};

type FlightOption = {
  offerId: string;

  ownerName: string;
  ownerCode: string | null;
  ownerLogoUrl: string | null;

  totalAmountCents: number;

  currency: string;

  expiresAt: string | null;

  outbound: FlightJourney;

  return: FlightJourney;

  isWithinBudget: boolean;
};

type FlightSearchResponse = {
  tripReferenceId: string;
  gcName: string;

  originAirportCode: string;

  returnAirportCode: string;

  destinationName: string;
  destinationCode: string;

  outboundDate: string;
  returnDate: string;

  adultPassengers: number;

  totalTripBudgetCents: number;
  flightBudgetCents: number;

  currency: string;

  flights: FlightOption[];
};

const API_BASE_URL =
  import.meta.env
    .VITE_API_BASE_URL ??
  "https://sdzjhwyt7f.execute-api.us-east-1.amazonaws.com/dev";

function formatCurrency(
  amountCents: number,
  currency: string
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency
    }
  ).format(
    amountCents / 100
  );
}

function formatDate(
  value: string
): string {
  const date =
    new Date(
      `${value.substring(
        0,
        10
      )}T12:00:00`
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(date);
}

function formatTime(
  value: string
): string {
  const date =
    new Date(value);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(date);
}

function formatDuration(
  minutes:
    | number
    | null
): string {
  if (
    minutes === null
  ) {
    return "Duration unavailable";
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`;
  }

  return (
    `${hours}h ` +
    `${remainingMinutes}m`
  );
}

function formatStops(
  stopCount: number
): string {
  if (stopCount === 0) {
    return "Nonstop";
  }

  if (stopCount === 1) {
    return "1 stop";
  }

  return `${stopCount} stops`;
}

function formatLoyaltyProgram(
  value: string
): string {
  return value
    .split("_")
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function getStarText(
  rating:
    | number
    | null
): string {
  if (!rating) {
    return "Unrated";
  }

  return (
    `${"★".repeat(
      rating
    )}` +
    `${"☆".repeat(
      Math.max(
        0,
        5 - rating
      )
    )}`
  );
}

function FlightJourneyView({
  label,
  journey
}: {
  label: string;
  journey: FlightJourney;
}) {
  return (
    <div className="flight-journey">
      <div className="flight-journey-heading">
        <div>
          <span>
            {label}
          </span>

          <strong>
            {
              journey
                .originAirportCode
            }
            {" → "}
            {
              journey
                .destinationAirportCode
            }
          </strong>
        </div>

        <div className="flight-journey-meta">
          <span>
            {formatDuration(
              journey
                .durationMinutes
            )}
          </span>

          <span>
            {formatStops(
              journey.stopCount
            )}
          </span>
        </div>
      </div>

      <div className="flight-time-row">
        <div>
          <strong>
            {formatTime(
              journey
                .departingAt
            )}
          </strong>

          <span>
            {
              journey
                .originAirportCode
            }
          </span>
        </div>

        <div className="flight-route-line">
          <span />
        </div>

        <div className="flight-time-arrival">
          <strong>
            {formatTime(
              journey
                .arrivingAt
            )}
          </strong>

          <span>
            {
              journey
                .destinationAirportCode
            }
          </span>
        </div>
      </div>

      <div className="flight-segments">
        {journey.segments.map(
          (segment) => (
            <div
              key={segment.id}
              className="flight-segment"
            >
              <div>
                <strong>
                  {
                    segment
                      .flightNumber
                  }
                </strong>

                <span>
                  {
                    segment
                      .originAirportCode
                  }
                  {" → "}
                  {
                    segment
                      .destinationAirportCode
                  }
                </span>
              </div>

              <div>
                <span className="flight-operating-carrier">
                  Operated by{" "}
                  {
                    segment
                      .operatingCarrierName
                  }
                </span>

                {segment.aircraftName && (
                  <span>
                    {
                      segment
                        .aircraftName
                    }
                  </span>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function BookingLinkPage({
  token
}: BookingLinkPageProps) {
  const [
    bookingLink,
    setBookingLink
  ] =
    useState<
      BookingLinkResponse |
      null
    >(null);

  const [
    flightSearch,
    setFlightSearch
  ] =
    useState<
      FlightSearchResponse |
      null
    >(null);

  const [
    hotelSearch,
    setHotelSearch
  ] =
    useState<
      HotelSearchResponse |
      null
    >(null);

  const [
    selectedFlightId,
    setSelectedFlightId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    selectedHotelId,
    setSelectedHotelId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  const [
    flightErrorMessage,
    setFlightErrorMessage
  ] =
    useState("");

  const [
    hotelErrorMessage,
    setHotelErrorMessage
  ] =
    useState("");

  const [
    isLoading,
    setIsLoading
  ] =
    useState(true);

  const [
    isSearchingFlights,
    setIsSearchingFlights
  ] =
    useState(false);

  const [
    isSearchingHotels,
    setIsSearchingHotels
  ] =
    useState(false);

  useEffect(() => {
    loadBookingLink();
  }, [token]);

  async function loadBookingLink() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/public/booking-links/` +
            encodeURIComponent(
              token
            ),
          {
            method: "GET",

            headers: {
              Accept:
                "application/json"
            }
          }
        );

      const responseBody =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseBody.message ??
            "Unable to load this booking link."
        );
      }

      setBookingLink(
        responseBody as
          BookingLinkResponse
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load this booking link."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function searchFlights() {
    setIsSearchingFlights(
      true
    );

    setFlightErrorMessage(
      ""
    );

    setSelectedFlightId(
      null
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/public/booking-links/` +
            `${encodeURIComponent(
              token
            )}` +
            "/flights/search",
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({})
          }
        );

      const responseBody =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseBody.message ??
            "Unable to search for flights."
        );
      }

      setFlightSearch(
        responseBody as
          FlightSearchResponse
      );
    } catch (error) {
      setFlightErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to search for flights."
      );
    } finally {
      setIsSearchingFlights(
        false
      );
    }
  }

  async function searchHotels() {
    setIsSearchingHotels(
      true
    );

    setHotelErrorMessage(
      ""
    );

    setSelectedHotelId(
      null
    );

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/public/booking-links/` +
            `${encodeURIComponent(
              token
            )}` +
            "/hotels/search",
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({})
          }
        );

      const responseBody =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseBody.message ??
            "Unable to search for hotels."
        );
      }

      setHotelSearch(
        responseBody as
          HotelSearchResponse
      );
    } catch (error) {
      setHotelErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to search for hotels."
      );
    } finally {
      setIsSearchingHotels(
        false
      );
    }
  }

  const selectedFlight =
    flightSearch
      ?.flights
      .find(
        (flight) =>
          flight.offerId ===
          selectedFlightId
      ) ?? null;

  const selectedHotel =
    hotelSearch
      ?.hotels
      .find(
        (hotel) =>
          hotel
            .searchResultId ===
          selectedHotelId
      ) ?? null;

  return (
    <main className="booking-link-page">
      <section className="booking-link-shell">
        <header className="booking-link-header">
          <div className="booking-link-brand">
            Aurem Travel
          </div>

          {bookingLink && (
            <div className="booking-link-header-reference">
              <span>
                Trip reference
              </span>

              <strong>
                {
                  bookingLink
                    .tripReferenceId
                }
              </strong>
            </div>
          )}
        </header>

        {isLoading && (
          <section className="booking-link-card">
            <h1>
              Loading your trip...
            </h1>

            <p>
              Please wait while we
              verify your secure
              booking link.
            </p>
          </section>
        )}

        {!isLoading &&
          errorMessage && (
            <section className="booking-link-card">
              <h1>
                We could not open
                this link
              </h1>

              <p className="booking-link-error">
                {errorMessage}
              </p>

              <p>
                Contact your case
                manager for a new
                link.
              </p>
            </section>
          )}

        {!isLoading &&
          bookingLink && (
            <>
              <section className="booking-link-card booking-link-intro">
                <p className="booking-link-eyebrow">
                  Secure travel
                  portal
                </p>

                <h1>
                  Hello,{" "}
                  {
                    bookingLink
                      .gcName
                  }
                </h1>

                <p>
                  Review the flight
                  and hotel options
                  available for your
                  trip and select the
                  options that work
                  best for you.
                </p>
              </section>

              <section className="travel-search-grid">
                <article className="travel-search-card">
                  <div className="travel-search-icon">
                    ✈
                  </div>

                  <div>
                    <p className="booking-link-eyebrow">
                      Flights
                    </p>

                    <h2>
                      Choose your
                      round-trip
                      flight
                    </h2>

                    <p>
                      Search economy
                      flights using
                      your trip's
                      approved dates,
                      airports, and
                      budget.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="travel-search-button"
                    onClick={
                      searchFlights
                    }
                    disabled={
                      isSearchingFlights
                    }
                  >
                    {isSearchingFlights
                      ? "Searching Flights..."
                      : flightSearch
                        ? "Refresh Flights"
                        : "Search Available Flights"}
                  </button>
                </article>

                <article className="travel-search-card">
                  <div className="travel-search-icon">
                    ▣
                  </div>

                  <div>
                    <p className="booking-link-eyebrow">
                      Hotels
                    </p>

                    <h2>
                      Choose your
                      hotel
                    </h2>

                    <p>
                      Search hotels
                      based on your
                      destination,
                      dates, star
                      rating, and
                      proximity
                      preferences.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="travel-search-button"
                    onClick={
                      searchHotels
                    }
                    disabled={
                      isSearchingHotels
                    }
                  >
                    {isSearchingHotels
                      ? "Searching Hotels..."
                      : hotelSearch
                        ? "Refresh Hotels"
                        : "Search Available Hotels"}
                  </button>
                </article>
              </section>

              {flightErrorMessage && (
                <section
                  className="travel-error-alert"
                  role="alert"
                >
                  <div className="travel-error-icon">
                    !
                  </div>

                  <div className="travel-error-content">
                    <h3>
                      We couldn't search for flights
                    </h3>

                    <p>
                      {flightErrorMessage}
                    </p>

                    <button
                      type="button"
                      className="travel-error-retry"
                      onClick={
                        searchFlights
                      }
                      disabled={
                        isSearchingFlights
                      }
                    >
                      {isSearchingFlights
                        ? "Trying Again..."
                        : "Try Again"}
                    </button>
                  </div>
                </section>
              )}

              {flightSearch && (
                <section className="flight-results-section">
                  <div className="travel-results-heading">
                    <div>
                      <p className="booking-link-eyebrow">
                        Flight options
                      </p>

                      <h2>
                        {
                          flightSearch
                            .originAirportCode
                        }
                        {" → "}
                        {
                          flightSearch
                            .destinationCode
                        }
                        {" → "}
                        {
                          flightSearch
                            .returnAirportCode
                        }
                      </h2>

                      <p>
                        {formatDate(
                          flightSearch
                            .outboundDate
                        )}
                        {" – "}
                        {formatDate(
                          flightSearch
                            .returnDate
                        )}
                        {" • "}
                        {
                          flightSearch
                            .adultPassengers
                        }
                        {flightSearch
                          .adultPassengers ===
                        1
                          ? " traveler"
                          : " travelers"}
                      </p>
                    </div>

                    <div className="travel-budget-summary">
                      <span>
                        Round-trip
                        flight
                        allowance
                      </span>

                      <strong>
                        {formatCurrency(
                          flightSearch
                            .flightBudgetCents,
                          flightSearch
                            .currency
                        )}
                      </strong>
                    </div>
                  </div>

                  {flightSearch
                    .flights
                    .length ===
                  0 ? (
                    <div className="booking-link-card travel-empty-state">
                      <h3>
                        No matching
                        flights found
                      </h3>

                      <p>
                        No round-trip
                        offers matched
                        the current
                        travel dates
                        and route.
                      </p>
                    </div>
                  ) : (
                    <div className="flight-results-list">
                      {flightSearch
                        .flights
                        .map(
                          (
                            flight
                          ) => {
                            const isSelected =
                              selectedFlightId ===
                              flight.offerId;

                            return (
                              <article
                                key={
                                  flight.offerId
                                }
                                className={
                                  `flight-card ${
                                    isSelected
                                      ? "flight-card-selected"
                                      : ""
                                  }`
                                }
                              >
                                <div className="flight-card-header">
                                  <div className="flight-airline">
                                    {flight.ownerLogoUrl && (
                                      <img
                                        src={
                                          flight.ownerLogoUrl
                                        }
                                        alt={
                                          flight.ownerName
                                        }
                                      />
                                    )}

                                    <div>
                                      <span>
                                        Offer
                                        from
                                      </span>

                                      <strong>
                                        {
                                          flight.ownerName
                                        }
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="flight-card-price">
                                    <span
                                      className={
                                        `travel-budget-badge ${
                                          flight.isWithinBudget
                                            ? "travel-budget-within"
                                            : "travel-budget-over"
                                        }`
                                      }
                                    >
                                      {flight.isWithinBudget
                                        ? "Within budget"
                                        : "Over budget"}
                                    </span>

                                    <strong>
                                      {formatCurrency(
                                        flight.totalAmountCents,
                                        flight.currency
                                      )}
                                    </strong>

                                    <span>
                                      round trip
                                    </span>
                                  </div>
                                </div>

                                <FlightJourneyView
                                  label="Outbound"
                                  journey={
                                    flight.outbound
                                  }
                                />

                                <FlightJourneyView
                                  label="Return"
                                  journey={
                                    flight.return
                                  }
                                />

                                <button
                                  type="button"
                                  className={
                                    `flight-select-button ${
                                      isSelected
                                        ? "flight-select-button-selected"
                                        : ""
                                    }`
                                  }
                                  onClick={() =>
                                    setSelectedFlightId(
                                      flight.offerId
                                    )
                                  }
                                >
                                  {isSelected
                                    ? "Selected"
                                    : "Select Flight"}
                                </button>
                              </article>
                            );
                          }
                        )}
                    </div>
                  )}

                  {selectedFlight && (
                    <div className="travel-selection-summary">
                      <div>
                        <span>
                          Selected
                          flight
                        </span>

                        <strong>
                          {
                            selectedFlight
                              .ownerName
                          }
                          {" • "}
                          {
                            selectedFlight
                              .outbound
                              .originAirportCode
                          }
                          {" → "}
                          {
                            selectedFlight
                              .outbound
                              .destinationAirportCode
                          }
                        </strong>

                        <p>
                          {formatCurrency(
                            selectedFlight
                              .totalAmountCents,
                            selectedFlight
                              .currency
                          )}
                          {
                            " round trip"
                          }
                        </p>
                      </div>

                      <p>
                        This selection
                        is currently
                        stored only in
                        this browser.
                        Saving it to the
                        trip comes next.
                      </p>
                    </div>
                  )}
                </section>
              )}

              {hotelErrorMessage && (
                <section
                  className="travel-error-alert"
                  role="alert"
                >
                  <div className="travel-error-icon">
                    !
                  </div>

                  <div className="travel-error-content">
                    <h3>
                      We couldn't search for hotels
                    </h3>

                    <p>
                      {hotelErrorMessage}
                    </p>

                    <button
                      type="button"
                      className="travel-error-retry"
                      onClick={
                        searchHotels
                      }
                      disabled={
                        isSearchingHotels
                      }
                    >
                      {isSearchingHotels
                        ? "Trying Again..."
                        : "Try Again"}
                    </button>
                  </div>
                </section>
              )}

              {hotelSearch && (
                <section className="hotel-results-section">
                  <div className="travel-results-heading">
                    <div>
                      <p className="booking-link-eyebrow">
                        Hotel options
                      </p>

                      <h2>
                        Stay near{" "}
                        {
                          hotelSearch
                            .destination
                        }
                      </h2>

                      <p>
                        {formatDate(
                          hotelSearch
                            .checkInDate
                        )}
                        {" – "}
                        {formatDate(
                          hotelSearch
                            .checkOutDate
                        )}
                        {" • "}
                        {
                          hotelSearch
                            .adultGuests
                        }
                        {hotelSearch
                          .adultGuests ===
                        1
                          ? " guest"
                          : " guests"}
                      </p>
                    </div>

                    <div className="travel-budget-summary">
                      <span>
                        Hotel allowance
                      </span>

                      <strong>
                        {formatCurrency(
                          hotelSearch
                            .hotelBudgetCents,
                          hotelSearch
                            .currency
                        )}
                      </strong>
                    </div>
                  </div>

                  {hotelSearch
                    .hotels
                    .length ===
                  0 ? (
                    <div className="booking-link-card travel-empty-state">
                      <h3>
                        No matching
                        hotels found
                      </h3>

                      <p>
                        No available
                        hotels matched
                        the current
                        dates, radius,
                        star rating, and
                        search criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="hotel-results-grid">
                      {hotelSearch
                        .hotels
                        .map(
                          (
                            hotel
                          ) => {
                            const isSelected =
                              selectedHotelId ===
                              hotel
                                .searchResultId;

                            return (
                              <article
                                key={
                                  hotel
                                    .searchResultId
                                }
                                className={
                                  `hotel-card ${
                                    isSelected
                                      ? "hotel-card-selected"
                                      : ""
                                  }`
                                }
                              >
                                <div className="hotel-card-image">
                                  {hotel.photoUrl ? (
                                    <img
                                      src={
                                        hotel.photoUrl
                                      }
                                      alt={
                                        hotel.name
                                      }
                                    />
                                  ) : (
                                    <div className="hotel-image-placeholder">
                                      Hotel
                                    </div>
                                  )}

                                  <span
                                    className={
                                      `hotel-budget-badge ${
                                        hotel.isWithinBudget
                                          ? "hotel-budget-within"
                                          : "hotel-budget-over"
                                      }`
                                    }
                                  >
                                    {hotel.isWithinBudget
                                      ? "Within budget"
                                      : "Over budget"}
                                  </span>
                                </div>

                                <div className="hotel-card-body">
                                  <div className="hotel-card-title-row">
                                    <div>
                                      <p className="hotel-stars">
                                        {getStarText(
                                          hotel.starRating
                                        )}
                                      </p>

                                      <h3>
                                        {
                                          hotel.name
                                        }
                                      </h3>
                                    </div>

                                    <div className="hotel-price">
                                      <strong>
                                        {formatCurrency(
                                          hotel.cheapestTotalAmountCents,
                                          hotel.currency
                                        )}
                                      </strong>

                                      <span>
                                        total
                                        stay
                                      </span>
                                    </div>
                                  </div>

                                  <p className="hotel-address">
                                    {
                                      hotel.address
                                    }
                                  </p>

                                  <div className="hotel-meta">
                                    {hotel.distanceFromDestinationMiles !==
                                      null && (
                                      <span>
                                        {
                                          hotel.distanceFromDestinationMiles
                                        }{" "}
                                        miles
                                        away
                                      </span>
                                    )}

                                    {hotel.reviewScore !==
                                      null && (
                                      <span>
                                        {
                                          hotel.reviewScore
                                        }
                                        /10
                                        {hotel.reviewCount !==
                                          null &&
                                          ` (${hotel.reviewCount} reviews)`}
                                      </span>
                                    )}
                                  </div>

                                  {hotel.amenities
                                    .length >
                                    0 && (
                                    <div className="hotel-amenities">
                                      {hotel.amenities
                                        .slice(
                                          0,
                                          4
                                        )
                                        .map(
                                          (
                                            amenity
                                          ) => (
                                            <span
                                              key={
                                                amenity
                                              }
                                            >
                                              {
                                                amenity
                                              }
                                            </span>
                                          )
                                        )}
                                    </div>
                                  )}

                                  {hotel.loyaltyProgram && (
                                    <p className="hotel-loyalty">
                                      Supports{" "}
                                      {formatLoyaltyProgram(
                                        hotel.loyaltyProgram
                                      )}
                                    </p>
                                  )}

                                  <button
                                    type="button"
                                    className={
                                      `hotel-select-button ${
                                        isSelected
                                          ? "hotel-select-button-selected"
                                          : ""
                                      }`
                                    }
                                    onClick={() =>
                                      setSelectedHotelId(
                                        hotel.searchResultId
                                      )
                                    }
                                  >
                                    {isSelected
                                      ? "Selected"
                                      : "Select Hotel"}
                                  </button>
                                </div>
                              </article>
                            );
                          }
                        )}
                    </div>
                  )}

                  {selectedHotel && (
                    <div className="travel-selection-summary">
                      <div>
                        <span>
                          Selected
                          hotel
                        </span>

                        <strong>
                          {
                            selectedHotel
                              .name
                          }
                        </strong>

                        <p>
                          {formatCurrency(
                            selectedHotel
                              .cheapestTotalAmountCents,
                            selectedHotel
                              .currency
                          )}
                          {" • "}
                          {
                            selectedHotel
                              .address
                          }
                        </p>
                      </div>

                      <p>
                        This selection
                        is currently
                        stored only in
                        this browser.
                        Saving it to the
                        trip comes next.
                      </p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
      </section>
    </main>
  );
}