import type { Trip } from "../../types/trip";

type TripsTableProps = {
  trips: Trip[];
  isSendingTripId: string | null;
  onEdit: (trip: Trip) => void;
  onSendToGc: (trip: Trip) => void;
};

function formatCurrencyCents(
  amount: number
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount / 100);
}

function canSendTrip(trip: Trip): boolean {
  return Boolean(
    trip.gcProfileId &&
      trip.gcEmail &&
      trip.tripPurpose &&
      trip.outboundDate &&
      trip.returnDate &&
      trip.outboundAirport &&
      trip.returnAirport &&
      trip.budgetFilter > 0 &&
      (
        trip.destinationCity ||
        trip.destinationAddress
      )
  );
}

function hasBeenSent(trip: Trip): boolean {
  return [
    "Link Sent",
    "Awaiting GC Selection",
    "Awaiting IPCM Approval",
    "Changes Requested",
    "Booking In Progress",
    "Booked"
  ].includes(trip.status);
}

export function TripsTable({
  trips,
  isSendingTripId,
  onEdit,
  onSendToGc
}: TripsTableProps) {
  return (
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
            <th>IPCM Approval</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {trips.length > 0 ? (
            trips.map((trip) => {
              const isReady = canSendTrip(trip);
              const wasSent = hasBeenSent(trip);
              const isSending =
                isSendingTripId === trip.id;

              return (
                <tr key={trip.id}>
                  <td>{trip.tripReferenceId}</td>
                  <td>{trip.caseReferenceId}</td>
                  <td>
                    <div className="trip-gc-cell">
                      <strong>{trip.gcName}</strong>

                      <span>
                        {trip.gcEmail || "No email"}
                      </span>
                    </div>
                  </td>
                  <td>{trip.tripPurpose}</td>

                  <td>
                    {trip.outboundDate?.substring(
                      0,
                      10
                    )}
                    {" → "}
                    {trip.returnDate?.substring(
                      0,
                      10
                    )}
                  </td>

                  <td>
                    {trip.outboundAirport}
                    {" → "}
                    {trip.returnAirport}
                  </td>

                  <td>
                    {trip.destinationCity ||
                      trip.destinationAddress ||
                      "-"}
                  </td>

                  <td>
                    {formatCurrencyCents(
                      trip.budgetFilter
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        trip.ipcmApprovalRequired
                          ? "approval-required"
                          : "approval-not-required"
                      }
                    >
                      {trip.ipcmApprovalRequired
                        ? "Required"
                        : "Not Required"}
                    </span>
                  </td>

                  <td>
                    <span className="trip-status">
                      {trip.status}
                    </span>
                  </td>

                  <td>
                    <div className="trip-row-actions">
                      <button
                        type="button"
                        className="trip-edit-button"
                        onClick={() => onEdit(trip)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="trip-send-button"
                        onClick={() =>
                          onSendToGc(trip)
                        }
                        disabled={
                          !isReady || isSending
                        }
                        title={
                          isReady
                            ? wasSent
                              ? "Send a new secure trip link"
                              : "Send a secure trip link"
                            : "Complete the trip and ensure the GC has an email address"
                        }
                      >
                        {isSending
                          ? "Sending..."
                          : wasSent
                            ? "Resend Link"
                            : "Send to GC"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                className="empty-state"
                colSpan={11}
              >
                No trips found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}