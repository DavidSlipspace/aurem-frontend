import type {
  Trip
} from "../../types/trip";

type TripsTableProps = {
  trips: Trip[];

  isSendingTripId:
    | string
    | null;

  onEdit:
    (
      trip: Trip
    ) => void;

  onSendToTraveler:
    (
      trip: Trip
    ) => void;
};

function formatCurrencyCents(
  amount: number,
  currency = "USD"
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency
    }
  ).format(
    amount / 100
  );
}

function canSendTrip(
  trip: Trip
): boolean {
  return Boolean(
    trip.travelerProfileId &&
    trip.travelerEmail &&
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

function hasBeenSent(
  trip: Trip
): boolean {
  return [
    "Link Sent",
    "Awaiting Traveler Selection",
    "Awaiting IPCM Approval",
    "Changes Requested",
    "Booking In Progress",
    "Booked"
  ].includes(
    trip.status
  );
}

function formatDateTime(
  value:
    | string
    | null
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

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

export function TripsTable({
  trips,
  isSendingTripId,
  onEdit,
  onSendToTraveler
}: TripsTableProps) {
  return (
    <div className="trips-table-card">
      <table>
        <thead>
          <tr>
            <th>
              Trip Reference
            </th>

            <th>
              Case
            </th>

            <th>
              Traveler
            </th>

            <th>
              Purpose
            </th>

            <th>
              Dates
            </th>

            <th>
              Route
            </th>

            <th>
              Destination
            </th>

            <th>
              Budget
            </th>

            <th>
              Flight
            </th>

            <th>
              Hotel
            </th>

            <th>
              IPCM Approval
            </th>

            <th>
              Status
            </th>

            <th>
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {trips.length > 0 ? (
            trips.map(
              (trip) => {
                const isReady =
                  canSendTrip(
                    trip
                  );

                const wasSent =
                  hasBeenSent(
                    trip
                  );

                const isSending =
                  isSendingTripId ===
                  trip.id;

                const flight =
                  trip
                    .selectedFlight;

                const hotel =
                  trip
                    .selectedHotel;

                return (
                  <tr key={trip.id}>
                    <td>
                      {
                        trip
                          .tripReferenceId
                      }
                    </td>

                    <td>
                      {
                        trip
                          .caseReferenceId
                      }
                    </td>

                    <td>
                      <div className="trip-traveler-cell">
                        <strong>
                          {
                            trip.travelerName
                          }
                        </strong>

                        <span>
                          {trip.travelerEmail ||
                            "No email"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {
                        trip
                          .tripPurpose
                      }
                    </td>

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
                      {
                        trip
                          .outboundAirport
                      }

                      {" → "}

                      {
                        trip
                          .returnAirport
                      }
                    </td>

                    <td>
                      {trip.destinationCity ||
                        trip.destinationAddress ||
                        "-"}
                    </td>

                    <td>
                      {formatCurrencyCents(
                        trip
                          .budgetFilter
                      )}
                    </td>

                    <td>
                      {flight ? (
                        <div className="trip-selection-cell">
                          <span className="trip-selection-status">
                            Selected
                          </span>

                          <strong>
                            {flight.airline ||
                              "Flight"}
                          </strong>

                          <span>
                            {flight.originAirport ||
                              "—"}
                            {" → "}
                            {flight.destinationAirport ||
                              "—"}
                          </span>

                          {flight.outboundDepartureAt && (
                            <span>
                              {formatDateTime(
                                flight
                                  .outboundDepartureAt
                              )}
                            </span>
                          )}

                          <span className="trip-selection-price">
                            {formatCurrencyCents(
                              flight.price,
                              flight.currency
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="trip-not-selected">
                          Not selected
                        </span>
                      )}
                    </td>

                    <td>
                      {hotel ? (
                        <div className="trip-selection-cell">
                          <span className="trip-selection-status">
                            Selected
                          </span>

                          <strong>
                            {hotel.name ||
                              "Hotel"}
                          </strong>

                          {hotel.checkInDate &&
                            hotel.checkOutDate && (
                              <span>
                                {hotel.checkInDate.substring(
                                  0,
                                  10
                                )}

                                {" → "}

                                {hotel.checkOutDate.substring(
                                  0,
                                  10
                                )}
                              </span>
                            )}

                          <span className="trip-selection-price">
                            {formatCurrencyCents(
                              hotel.price,
                              hotel.currency
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="trip-not-selected">
                          Not selected
                        </span>
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
                        {
                          trip.status
                        }
                      </span>
                    </td>

                    <td>
                      <div className="trip-row-actions">
                        <button
                          type="button"
                          className="trip-edit-button"
                          onClick={() =>
                            onEdit(
                              trip
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="trip-send-button"
                          onClick={() =>
                            onSendToTraveler(
                              trip
                            )
                          }
                          disabled={
                            !isReady ||
                            isSending
                          }
                          title={
                            isReady
                              ? wasSent
                                ? "Send a new secure trip link"
                                : "Send a secure trip link"
                              : "Complete the trip and ensure the Traveler has an email address"
                          }
                        >
                          {isSending
                            ? "Sending..."
                            : wasSent
                              ? "Resend Link"
                              : "Send to Traveler"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
            )
          ) : (
            <tr>
              <td
                className="empty-state"
                colSpan={13}
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