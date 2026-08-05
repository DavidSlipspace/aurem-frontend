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
  minimumStarRating: number | null;

  totalTripBudgetCents: number;
  hotelBudgetCents: number;
  currency: string;

  hotels: HotelOption[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
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
  ).format(amountCents / 100);
}

function formatDate(
  value: string
): string {
  const date = new Date(
    `${value.substring(0, 10)}T12:00:00`
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

function formatLoyaltyProgram(
  value: string
): string {
  return value
    .split("_")
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

function getStarText(
  rating: number | null
): string {
  if (!rating) {
    return "Unrated";
  }

  return `${"★".repeat(rating)}${"☆".repeat(
    Math.max(0, 5 - rating)
  )}`;
}

export function BookingLinkPage({
  token
}: BookingLinkPageProps) {
  const [
    bookingLink,
    setBookingLink
  ] =
    useState<BookingLinkResponse | null>(
      null
    );

  const [
    hotelSearch,
    setHotelSearch
  ] =
    useState<HotelSearchResponse | null>(
      null
    );

  const [
    selectedHotelId,
    setSelectedHotelId
  ] =
    useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage
  ] = useState("");

  const [
    hotelErrorMessage,
    setHotelErrorMessage
  ] = useState("");

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    isSearchingHotels,
    setIsSearchingHotels
  ] = useState(false);

  useEffect(() => {
    loadBookingLink();
  }, [token]);

  async function loadBookingLink() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/booking-links/` +
          encodeURIComponent(token),
        {
          method: "GET",
          headers: {
            Accept: "application/json"
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
        responseBody as BookingLinkResponse
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

  async function searchHotels() {
    setIsSearchingHotels(true);
    setHotelErrorMessage("");
    setSelectedHotelId(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/public/booking-links/` +
          `${encodeURIComponent(token)}` +
          "/hotels/search",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({})
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
        responseBody as HotelSearchResponse
      );
    } catch (error) {
      setHotelErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to search for hotels."
      );
    } finally {
      setIsSearchingHotels(false);
    }
  }

  const selectedHotel =
    hotelSearch?.hotels.find(
      (hotel) =>
        hotel.searchResultId ===
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
              <span>Trip reference</span>

              <strong>
                {bookingLink.tripReferenceId}
              </strong>
            </div>
          )}
        </header>

        {isLoading && (
          <section className="booking-link-card">
            <h1>Loading your trip...</h1>

            <p>
              Please wait while we verify your
              secure booking link.
            </p>
          </section>
        )}

        {!isLoading && errorMessage && (
          <section className="booking-link-card">
            <h1>
              We could not open this link
            </h1>

            <p className="booking-link-error">
              {errorMessage}
            </p>

            <p>
              Contact your case manager for a
              new link.
            </p>
          </section>
        )}

        {!isLoading && bookingLink && (
          <>
            <section className="booking-link-card booking-link-intro">
              <p className="booking-link-eyebrow">
                Secure travel portal
              </p>

              <h1>
                Hello, {bookingLink.gcName}
              </h1>

              <p>
                Review hotel options that match
                the destination, dates, budget,
                and preferences provided by your
                case manager.
              </p>

              {!hotelSearch && (
                <button
                  type="button"
                  className="hotel-search-button"
                  onClick={searchHotels}
                  disabled={isSearchingHotels}
                >
                  {isSearchingHotels
                    ? "Searching Hotels..."
                    : "Search Available Hotels"}
                </button>
              )}
            </section>

            {hotelErrorMessage && (
              <section className="booking-link-card">
                <p className="booking-link-error">
                  {hotelErrorMessage}
                </p>

                <button
                  type="button"
                  className="hotel-search-button"
                  onClick={searchHotels}
                  disabled={isSearchingHotels}
                >
                  {isSearchingHotels
                    ? "Searching Hotels..."
                    : "Try Again"}
                </button>
              </section>
            )}

            {hotelSearch && (
              <section className="hotel-results-section">
                <div className="hotel-results-heading">
                  <div>
                    <p className="booking-link-eyebrow">
                      Hotel options
                    </p>

                    <h2>
                      Stay near{" "}
                      {hotelSearch.destination}
                    </h2>

                    <p>
                      {formatDate(
                        hotelSearch.checkInDate
                      )}
                      {" – "}
                      {formatDate(
                        hotelSearch.checkOutDate
                      )}
                      {" • "}
                      {hotelSearch.adultGuests}
                      {hotelSearch.adultGuests ===
                      1
                        ? " guest"
                        : " guests"}
                    </p>
                  </div>

                  <div className="hotel-budget-summary">
                    <span>
                      Hotel allowance
                    </span>

                    <strong>
                      {formatCurrency(
                        hotelSearch.hotelBudgetCents,
                        hotelSearch.currency
                      )}
                    </strong>
                  </div>
                </div>

                {hotelSearch.hotels.length ===
                0 ? (
                  <div className="booking-link-card hotel-empty-state">
                    <h3>
                      No matching hotels found
                    </h3>

                    <p>
                      No available hotels matched
                      the current dates, radius,
                      star rating, and search
                      criteria.
                    </p>

                    <button
                      type="button"
                      className="hotel-search-button"
                      onClick={searchHotels}
                      disabled={
                        isSearchingHotels
                      }
                    >
                      Search Again
                    </button>
                  </div>
                ) : (
                  <div className="hotel-results-grid">
                    {hotelSearch.hotels.map(
                      (hotel) => {
                        const isSelected =
                          selectedHotelId ===
                          hotel.searchResultId;

                        return (
                          <article
                            key={
                              hotel.searchResultId
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
                                  alt={hotel.name}
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
                                    {hotel.name}
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
                                {hotel.address}
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

                              {hotel.amenities.length >
                                0 && (
                                <div className="hotel-amenities">
                                  {hotel.amenities
                                    .slice(0, 4)
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
                  <div className="hotel-selection-summary">
                    <div>
                      <span>
                        Selected hotel
                      </span>

                      <strong>
                        {selectedHotel.name}
                      </strong>

                      <p>
                        {formatCurrency(
                          selectedHotel.cheapestTotalAmountCents,
                          selectedHotel.currency
                        )}
                        {" • "}
                        {selectedHotel.address}
                      </p>
                    </div>

                    <p>
                      This selection is currently
                      stored only in this browser.
                      Saving the selection to the
                      trip will be added next.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="hotel-refresh-button"
                  onClick={searchHotels}
                  disabled={isSearchingHotels}
                >
                  {isSearchingHotels
                    ? "Refreshing..."
                    : "Refresh Hotel Options"}
                </button>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}