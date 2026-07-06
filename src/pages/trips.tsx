import { useEffect, useState } from "react";
import { getTrips } from "../api/tripApi";
import type { Trip } from "../types/trip";
import "./trips.css";

type TripsPageProps = {
  idToken: string;
};

export function TripsPage({ idToken }: TripsPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getTrips(idToken);
      setTrips(response.trips);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load trips."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrencyCents(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount / 100);
  }

  return (
    <main className="trips-page">
      <section className="trips-content">
        <div className="trips-header">
          <div>
            <h1>Trips</h1>
            <p>Create and manage travel requests.</p>
          </div>

          <button>+ New Trip</button>
        </div>

        {errorMessage && <p className="trips-error">{errorMessage}</p>}
        {isLoading && <p className="trips-loading">Loading trips...</p>}

        <div className="trips-table-card">
          <table>
            <thead>
              <tr>
                <th>Trip Reference</th>
                <th>Case</th>
                <th>GC</th>
                <th>Purpose</th>
                <th>Dates</th>
                <th>Route</th>
                <th>Destination</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.tripReferenceId}</td>
                    <td>{trip.caseReferenceId}</td>
                    <td>{trip.gcName}</td>
                    <td>{trip.tripPurpose}</td>
                    <td>
                      {trip.outboundDate?.substring(0, 10)} →{" "}
                      {trip.returnDate?.substring(0, 10)}
                    </td>
                    <td>
                      {trip.outboundAirport} → {trip.returnAirport}
                    </td>
                    <td>{trip.destinationCity || trip.destinationAddress || "-"}</td>
                    <td>{formatCurrencyCents(trip.budgetFilter)}</td>
                    <td>
                      <span className="trip-status">{trip.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={9}>
                    No trips found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}