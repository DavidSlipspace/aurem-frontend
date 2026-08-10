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

type TravelApiError = {
  code: string;
  title: string;
  message: string;
  canRetry: boolean;
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

type PortalMode =
  | "select"
  | "review";

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

function formatDateTime(
  value: string
): string {
  const date =
    new Date(value);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
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

function getDefaultApiError(
  message: string
): TravelApiError {
  return {
    code: "UNKNOWN_ERROR",
    title: "Something went wrong",
    message,
    canRetry: true
  };
}

async function readApiResponse(
  response: Response
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text
    );
  } catch {
    return {
      message:
        "The server returned an unexpected response."
    };
  }
}

function parseApiError(
  body: unknown,
  fallbackMessage: string
): TravelApiError {
  if (
    typeof body === "object" &&
    body !== null
  ) {
    const record =
      body as Record<
        string,
        unknown
      >;

    const message =
      typeof record.message ===
        "string"
        ? record.message
        : fallbackMessage;

    return {
      code:
        typeof record.code ===
          "string"
          ? record.code
          : "UNKNOWN_ERROR",

      title:
        typeof record.title ===
          "string"
          ? record.title
          : "Something went wrong",

      message,

      canRetry:
        typeof record.canRetry ===
          "boolean"
          ? record.canRetry
          : true
    };
  }

  return getDefaultApiError(
    fallbackMessage
  );
}

function scrollToElement(
  id: string
) {
  window.setTimeout(
    () => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    },
    100
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
              key={
                segment.id
              }
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

function TravelErrorAlert({
  error,
  retryLabel,
  isRetrying,
  onRetry
}: {
  error: TravelApiError;
  retryLabel: string;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <section
      className="travel-error-alert"
      role="alert"
    >
      <div className="travel-error-icon">
        !
      </div>

      <div className="travel-error-content">
        <h3>
          {error.title}
        </h3>

        <p>
          {error.message}
        </p>

        {!error.canRetry && (
          <p className="travel-error-guidance">
            This issue cannot be
            corrected from the
            traveler portal.
          </p>
        )}

        {error.canRetry && (
          <button
            type="button"
            className="travel-error-retry"
            onClick={onRetry}
            disabled={
              isRetrying
            }
          >
            {isRetrying
              ? "Trying Again..."
              : retryLabel}
          </button>
        )}
      </div>
    </section>
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
    showFlightResults,
    setShowFlightResults
  ] =
    useState(false);

  const [
    showHotelResults,
    setShowHotelResults
  ] =
    useState(false);

  const [
    portalMode,
    setPortalMode
  ] =
    useState<PortalMode>(
      "select"
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  const [
    flightError,
    setFlightError
  ] =
    useState<
      TravelApiError |
      null
    >(null);

  const [
    hotelError,
    setHotelError
  ] =
    useState<
      TravelApiError |
      null
    >(null);

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

  useEffect(
    () => {
      loadBookingLink();
    },
    [token]
  );

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
        await readApiResponse(
          response
        );

      if (!response.ok) {
        const error =
          parseApiError(
            responseBody,
            "Unable to load this booking link."
          );

        throw new Error(
          error.message
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
    setPortalMode(
      "select"
    );

    setIsSearchingFlights(
      true
    );

    setFlightError(
      null
    );

    setSelectedFlightId(
      null
    );

    setShowFlightResults(
      false
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
        await readApiResponse(
          response
        );

      if (!response.ok) {
        setFlightSearch(
          null
        );

        setFlightError(
          parseApiError(
            responseBody,
            "Unable to search for flights."
          )
        );

        return;
      }

      const searchResult =
        responseBody as
          FlightSearchResponse;

      setFlightSearch(
        searchResult
      );

      setShowFlightResults(
        true
      );

      if (
        searchResult
          .flights
          .length === 0
      ) {
        setFlightError({
          code:
            "NO_FLIGHTS_FOUND",

          title:
            "No flights were found",

          message:
            "No available round-trip flight options matched the current route and dates.",

          canRetry:
            false
        });
      }

      scrollToElement(
        "flight-results"
      );
    } catch (error) {
      setFlightError(
        getDefaultApiError(
          error instanceof Error
            ? error.message
            : "Unable to search for flights."
        )
      );
    } finally {
      setIsSearchingFlights(
        false
      );
    }
  }

  async function searchHotels() {
    setPortalMode(
      "select"
    );

    setIsSearchingHotels(
      true
    );

    setHotelError(
      null
    );

    setSelectedHotelId(
      null
    );

    setShowHotelResults(
      false
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
        await readApiResponse(
          response
        );

      if (!response.ok) {
        setHotelSearch(
          null
        );

        setHotelError(
          parseApiError(
            responseBody,
            "Unable to search for hotels."
          )
        );

        return;
      }

      const searchResult =
        responseBody as
          HotelSearchResponse;

      setHotelSearch(
        searchResult
      );

      setShowHotelResults(
        true
      );

      if (
        searchResult
          .hotels
          .length === 0
      ) {
        setHotelError({
          code:
            "NO_HOTELS_FOUND",

          title:
            "No hotels were found",

          message:
            "No available hotels matched the current destination, dates, and trip preferences.",

          canRetry:
            false
        });
      }

      scrollToElement(
        "hotel-results"
      );
    } catch (error) {
      setHotelError(
        getDefaultApiError(
          error instanceof Error
            ? error.message
            : "Unable to search for hotels."
        )
      );
    } finally {
      setIsSearchingHotels(
        false
      );
    }
  }

  function selectFlight(
    offerId: string
  ) {
    setSelectedFlightId(
      offerId
    );

    setShowFlightResults(
      false
    );

    setPortalMode(
      "select"
    );

    scrollToElement(
      "hotel-step"
    );
  }

  function changeFlight() {
    setPortalMode(
      "select"
    );

    setShowFlightResults(
      true
    );

    scrollToElement(
      "flight-results"
    );
  }

  function selectHotel(
    searchResultId: string
  ) {
    setSelectedHotelId(
      searchResultId
    );

    setShowHotelResults(
      false
    );

    setPortalMode(
      "select"
    );

    window.setTimeout(
      () => {
        window.scrollTo({
          top:
            document.body
              .scrollHeight,
          behavior:
            "smooth"
        });
      },
      100
    );
  }

  function changeHotel() {
    setPortalMode(
      "select"
    );

    setShowHotelResults(
      true
    );

    scrollToElement(
      "hotel-results"
    );
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

  const flightComplete =
    selectedFlight !== null;

  const hotelComplete =
    selectedHotel !== null;

  const readyForReview =
    flightComplete &&
    hotelComplete;

  function openReview() {
    if (
      !readyForReview
    ) {
      return;
    }

    setPortalMode(
      "review"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function exitReview() {
    setPortalMode(
      "select"
    );
  }

  if (
    isLoading
  ) {
    return (
      <main className="booking-link-page">
        <section className="booking-link-shell">
          <header className="booking-link-header">
            <div className="booking-link-brand">
              Aurem Travel
            </div>
          </header>

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
        </section>
      </main>
    );
  }

  if (
    errorMessage ||
    !bookingLink
  ) {
    return (
      <main className="booking-link-page">
        <section className="booking-link-shell">
          <header className="booking-link-header">
            <div className="booking-link-brand">
              Aurem Travel
            </div>
          </header>

          <section className="booking-link-card">
            <h1>
              We could not open
              this link
            </h1>

            <p className="booking-link-error">
              {errorMessage}
            </p>

            <p className="booking-link-secondary-copy">
              Contact your case
              manager for a new
              booking link.
            </p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-link-page">
      <section className="booking-link-shell">
        <header className="booking-link-header">
          <div className="booking-link-brand">
            Aurem Travel
          </div>

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
        </header>

        <nav
          className="travel-progress"
          aria-label="Travel selection progress"
        >
          <div
            className={
              `travel-progress-step ${
                flightComplete
                  ? "travel-progress-step-complete"
                  : "travel-progress-step-active"
              }`
            }
          >
            <span className="travel-progress-number">
              {flightComplete
                ? "✓"
                : "1"}
            </span>

            <div>
              <strong>
                Flight
              </strong>

              <span>
                {flightComplete
                  ? "Selected"
                  : "Choose a flight"}
              </span>
            </div>
          </div>

          <div className="travel-progress-line" />

          <div
            className={
              `travel-progress-step ${
                hotelComplete
                  ? "travel-progress-step-complete"
                  : flightComplete
                    ? "travel-progress-step-active"
                    : ""
              }`
            }
          >
            <span className="travel-progress-number">
              {hotelComplete
                ? "✓"
                : "2"}
            </span>

            <div>
              <strong>
                Hotel
              </strong>

              <span>
                {hotelComplete
                  ? "Selected"
                  : "Choose a hotel"}
              </span>
            </div>
          </div>

          <div className="travel-progress-line" />

          <div
            className={
              `travel-progress-step ${
                portalMode ===
                "review"
                  ? "travel-progress-step-active"
                  : readyForReview
                    ? "travel-progress-step-ready"
                    : ""
              }`
            }
          >
            <span className="travel-progress-number">
              3
            </span>

            <div>
              <strong>
                Review
              </strong>

              <span>
                Confirm choices
              </span>
            </div>
          </div>
        </nav>

        {portalMode ===
        "review" ? (
          <section className="review-page">
            <div className="booking-link-card review-card">
              <p className="booking-link-eyebrow">
                Final review
              </p>

              <h1>
                Review your selections
              </h1>

              <p>
                Confirm that the flight
                and hotel below are the
                options you want before
                continuing.
              </p>
            </div>

            {selectedFlight &&
              flightSearch && (
                <article className="review-selection-card">
                  <div className="review-selection-header">
                    <div>
                      <span className="review-check">
                        ✓
                      </span>

                      <div>
                        <p className="booking-link-eyebrow">
                          Flight
                        </p>

                        <h2>
                          {
                            selectedFlight
                              .ownerName
                          }
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="secondary-action-button"
                      onClick={() => {
                        exitReview();
                        changeFlight();
                      }}
                    >
                      Change flight
                    </button>
                  </div>

                  <div className="review-flight-grid">
                    <div>
                      <span>
                        Outbound
                      </span>

                      <strong>
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
                        {formatDateTime(
                          selectedFlight
                            .outbound
                            .departingAt
                        )}
                      </p>
                    </div>

                    <div>
                      <span>
                        Return
                      </span>

                      <strong>
                        {
                          selectedFlight
                            .return
                            .originAirportCode
                        }
                        {" → "}
                        {
                          selectedFlight
                            .return
                            .destinationAirportCode
                        }
                      </strong>

                      <p>
                        {formatDateTime(
                          selectedFlight
                            .return
                            .departingAt
                        )}
                      </p>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedFlight
                            .totalAmountCents,
                          selectedFlight
                            .currency
                        )}
                      </strong>

                      <p>
                        Round trip
                      </p>
                    </div>
                  </div>
                </article>
              )}

            {selectedHotel &&
              hotelSearch && (
                <article className="review-selection-card">
                  <div className="review-selection-header">
                    <div>
                      <span className="review-check">
                        ✓
                      </span>

                      <div>
                        <p className="booking-link-eyebrow">
                          Hotel
                        </p>

                        <h2>
                          {
                            selectedHotel
                              .name
                          }
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="secondary-action-button"
                      onClick={() => {
                        exitReview();
                        changeHotel();
                      }}
                    >
                      Change hotel
                    </button>
                  </div>

                  <div className="review-hotel-grid">
                    <div>
                      <span>
                        Stay
                      </span>

                      <strong>
                        {formatDate(
                          hotelSearch
                            .checkInDate
                        )}
                        {" – "}
                        {formatDate(
                          hotelSearch
                            .checkOutDate
                        )}
                      </strong>

                      <p>
                        {
                          selectedHotel
                            .address
                        }
                      </p>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedHotel
                            .cheapestTotalAmountCents,
                          selectedHotel
                            .currency
                        )}
                      </strong>

                      <p>
                        Hotel stay
                      </p>
                    </div>
                  </div>
                </article>
              )}

            {selectedFlight &&
              selectedHotel && (
                <section className="review-total-card">
                  <div>
                    <span>
                      Selected travel total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedFlight
                          .totalAmountCents +
                          selectedHotel
                            .cheapestTotalAmountCents,
                        selectedFlight
                          .currency
                      )}
                    </strong>
                  </div>

                  <p>
                    Your selections have
                    not been submitted
                    yet. The next
                    development step will
                    save both choices
                    together before this
                    portal can be safely
                    closed.
                  </p>
                </section>
              )}

            <div className="review-actions">
              <button
                type="button"
                className="secondary-action-button"
                onClick={
                  exitReview
                }
              >
                Back to selections
              </button>

              <button
                type="button"
                className="primary-action-button"
                disabled
                title="Selection submission will be enabled after backend persistence is added."
              >
                Submit selections
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="booking-link-card booking-link-intro">
              <p className="booking-link-eyebrow">
                Secure travel portal
              </p>

              <h1>
                Hello,{" "}
                {
                  bookingLink
                    .gcName
                }
              </h1>

              <p>
                Choose your preferred
                flight and hotel. You
                will review both
                selections together
                before submitting them.
              </p>
            </section>

            <section className="travel-search-grid">
              <article
                id="flight-step"
                className={
                  `travel-search-card ${
                    flightComplete
                      ? "travel-search-card-complete"
                      : ""
                  }`
                }
              >
                <div className="travel-search-icon">
                  {flightComplete
                    ? "✓"
                    : "✈"}
                </div>

                <div>
                  <p className="booking-link-eyebrow">
                    Step 1
                  </p>

                  <h2>
                    {flightComplete
                      ? "Flight selected"
                      : "Choose your round-trip flight"}
                  </h2>

                  {selectedFlight ? (
                    <p>
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
                      {" • "}
                      {formatCurrency(
                        selectedFlight
                          .totalAmountCents,
                        selectedFlight
                          .currency
                      )}
                    </p>
                  ) : (
                    <p>
                      Compare available
                      economy flights
                      using the approved
                      trip dates,
                      airports, and
                      budget.
                    </p>
                  )}
                </div>

                {selectedFlight ? (
                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={
                      changeFlight
                    }
                  >
                    Change flight
                  </button>
                ) : (
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
                        ? "View Flight Options"
                        : "Search Available Flights"}
                  </button>
                )}
              </article>

              <article
                id="hotel-step"
                className={
                  `travel-search-card ${
                    hotelComplete
                      ? "travel-search-card-complete"
                      : ""
                  }`
                }
              >
                <div className="travel-search-icon">
                  {hotelComplete
                    ? "✓"
                    : "▣"}
                </div>

                <div>
                  <p className="booking-link-eyebrow">
                    Step 2
                  </p>

                  <h2>
                    {hotelComplete
                      ? "Hotel selected"
                      : "Choose your hotel"}
                  </h2>

                  {selectedHotel ? (
                    <p>
                      {
                        selectedHotel
                          .name
                      }
                      {" • "}
                      {formatCurrency(
                        selectedHotel
                          .cheapestTotalAmountCents,
                        selectedHotel
                          .currency
                      )}
                    </p>
                  ) : (
                    <p>
                      Compare hotels
                      using the approved
                      destination,
                      dates, star rating,
                      proximity, and
                      budget.
                    </p>
                  )}
                </div>

                {selectedHotel ? (
                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={
                      changeHotel
                    }
                  >
                    Change hotel
                  </button>
                ) : (
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
                        ? "View Hotel Options"
                        : "Search Available Hotels"}
                  </button>
                )}
              </article>
            </section>

            {flightError && (
              <TravelErrorAlert
                error={
                  flightError
                }
                retryLabel="Try Flight Search Again"
                isRetrying={
                  isSearchingFlights
                }
                onRetry={
                  searchFlights
                }
              />
            )}

            {flightSearch &&
              showFlightResults &&
              !flightError && (
                <section
                  id="flight-results"
                  className="flight-results-section"
                >
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
                            .flights
                            .length
                        }
                        {
                          flightSearch
                            .flights
                            .length ===
                          1
                            ? " option"
                            : " options"
                        }
                      </p>
                    </div>

                    <div className="travel-budget-summary">
                      <span>
                        Round-trip
                        flight allowance
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

                  <div className="flight-results-list">
                    {flightSearch
                      .flights
                      .map(
                        (
                          flight
                        ) => (
                          <article
                            key={
                              flight.offerId
                            }
                            className="flight-card"
                          >
                            <div className="flight-card-header">
                              <div className="flight-airline">
                                {flight.ownerLogoUrl && (
                                  <img
                                    src={
                                      flight.ownerLogoUrl
                                    }
                                    alt=""
                                  />
                                )}

                                <div>
                                  <span>
                                    Airline
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
                              className="flight-select-button"
                              onClick={() =>
                                selectFlight(
                                  flight.offerId
                                )
                              }
                            >
                              Select this flight
                            </button>
                          </article>
                        )
                      )}
                  </div>
                </section>
              )}

            {selectedFlight &&
              !showFlightResults && (
                <section className="confirmed-selection-card">
                  <div className="confirmed-selection-check">
                    ✓
                  </div>

                  <div className="confirmed-selection-main">
                    <p className="booking-link-eyebrow">
                      Flight selected
                    </p>

                    <h2>
                      {
                        selectedFlight
                          .ownerName
                      }
                    </h2>

                    <div className="confirmed-flight-details">
                      <div>
                        <span>
                          Outbound
                        </span>

                        <strong>
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
                          {formatDateTime(
                            selectedFlight
                              .outbound
                              .departingAt
                          )}
                        </p>
                      </div>

                      <div>
                        <span>
                          Return
                        </span>

                        <strong>
                          {
                            selectedFlight
                              .return
                              .originAirportCode
                          }
                          {" → "}
                          {
                            selectedFlight
                              .return
                              .destinationAirportCode
                          }
                        </strong>

                        <p>
                          {formatDateTime(
                            selectedFlight
                              .return
                              .departingAt
                          )}
                        </p>
                      </div>

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatCurrency(
                            selectedFlight
                              .totalAmountCents,
                            selectedFlight
                              .currency
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={
                      changeFlight
                    }
                  >
                    Change flight
                  </button>
                </section>
              )}

            {hotelError && (
              <TravelErrorAlert
                error={
                  hotelError
                }
                retryLabel="Try Hotel Search Again"
                isRetrying={
                  isSearchingHotels
                }
                onRetry={
                  searchHotels
                }
              />
            )}

            {hotelSearch &&
              showHotelResults &&
              !hotelError && (
                <section
                  id="hotel-results"
                  className="hotel-results-section"
                >
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
                            .hotels
                            .length
                        }
                        {
                          hotelSearch
                            .hotels
                            .length ===
                          1
                            ? " option"
                            : " options"
                        }
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

                  <div className="hotel-results-grid">
                    {hotelSearch
                      .hotels
                      .map(
                        (
                          hotel
                        ) => (
                          <article
                            key={
                              hotel
                                .searchResultId
                            }
                            className="hotel-card"
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
                                    total stay
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
                                    miles away
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
                                className="hotel-select-button"
                                onClick={() =>
                                  selectHotel(
                                    hotel.searchResultId
                                  )
                                }
                              >
                                Select this hotel
                              </button>
                            </div>
                          </article>
                        )
                      )}
                  </div>
                </section>
              )}

            {selectedHotel &&
              !showHotelResults && (
                <section className="confirmed-selection-card">
                  <div className="confirmed-selection-check">
                    ✓
                  </div>

                  <div className="confirmed-selection-main">
                    <p className="booking-link-eyebrow">
                      Hotel selected
                    </p>

                    <h2>
                      {
                        selectedHotel
                          .name
                      }
                    </h2>

                    <div className="confirmed-hotel-details">
                      <div>
                        <span>
                          Stay
                        </span>

                        <strong>
                          {formatDate(
                            hotelSearch!
                              .checkInDate
                          )}
                          {" – "}
                          {formatDate(
                            hotelSearch!
                              .checkOutDate
                          )}
                        </strong>

                        <p>
                          {
                            selectedHotel
                              .address
                          }
                        </p>
                      </div>

                      <div>
                        <span>
                          Total
                        </span>

                        <strong>
                          {formatCurrency(
                            selectedHotel
                              .cheapestTotalAmountCents,
                            selectedHotel
                              .currency
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={
                      changeHotel
                    }
                  >
                    Change hotel
                  </button>
                </section>
              )}

            {readyForReview && (
              <div className="review-cta-spacer" />
            )}

            {readyForReview && (
              <aside className="review-sticky-bar">
                <div>
                  <strong>
                    Flight and hotel selected
                  </strong>

                  <span>
                    Review both choices
                    before submitting.
                  </span>
                </div>

                <button
                  type="button"
                  className="primary-action-button"
                  onClick={
                    openReview
                  }
                >
                  Review selections
                </button>
              </aside>
            )}
          </>
        )}
      </section>
    </main>
  );
}