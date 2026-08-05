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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://sdzjhwyt7f.execute-api.us-east-1.amazonaws.com/dev";

export function BookingLinkPage({
  token
}: BookingLinkPageProps) {
  const [bookingLink, setBookingLink] =
    useState<BookingLinkResponse | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

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

      const responseBody = await response.json();

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

  return (
    <main className="booking-link-page">
      <section className="booking-link-card">
        <div className="booking-link-brand">
          Aurem Travel
        </div>

        {isLoading && (
          <>
            <h1>Loading your trip...</h1>

            <p>
              Please wait while we verify your secure
              booking link.
            </p>
          </>
        )}

        {!isLoading && errorMessage && (
          <>
            <h1>We could not open this link</h1>

            <p className="booking-link-error">
              {errorMessage}
            </p>

            <p>
              Contact your case manager for a new link.
            </p>
          </>
        )}

        {!isLoading && bookingLink && (
          <>
            <p className="booking-link-eyebrow">
              Secure travel portal
            </p>

            <h1>
              Hello, {bookingLink.gcName}
            </h1>

            <p>
              Your traveler portal is ready. Flight and
              hotel selections will appear here in the
              next step of development.
            </p>

            <div className="booking-link-reference">
              <span>Trip reference</span>

              <strong>
                {bookingLink.tripReferenceId}
              </strong>
            </div>
          </>
        )}
      </section>
    </main>
  );
}