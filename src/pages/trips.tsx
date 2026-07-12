import {
  FormEvent,
  useEffect,
  useState
} from "react";

import {
  createTrip,
  getTrips,
  updateTrip
} from "../api/tripApi";

import { getCases } from "../api/caseApi";
import { getGcProfiles } from "../api/gcProfileApi";

import type { CaseResponse } from "../types/case";
import type { GcProfile } from "../types/gcProfile";
import type {
  Trip,
  TripRequest
} from "../types/trip";

import "./trips.css";

type TripsPageProps = {
  idToken: string;
};

type TripFormState = {
  caseId: string;
  gcProfileId: string;
  tripPurpose: string;
  outboundDate: string;
  returnDate: string;
  outboundAirport: string;
  returnAirport: string;
  destinationCity: string;
  destinationAddress: string;
  hotelProximityPreference: string;
  minimumHotelStarRating: string;
  budgetDollars: string;
  companionTraveler: boolean;
  status: string;
};

const emptyForm: TripFormState = {
  caseId: "",
  gcProfileId: "",
  tripPurpose: "",
  outboundDate: "",
  returnDate: "",
  outboundAirport: "",
  returnAirport: "",
  destinationCity: "",
  destinationAddress: "",
  hotelProximityPreference: "",
  minimumHotelStarRating: "",
  budgetDollars: "",
  companionTraveler: false,
  status: "Created"
};

export function TripsPage({ idToken }: TripsPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [gcProfiles, setGcProfiles] = useState<GcProfile[]>([]);

  const [formData, setFormData] =
    useState<TripFormState>(emptyForm);

  const [editingTripId, setEditingTripId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPageData();
  }, [idToken]);

  async function loadPageData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        tripsResponse,
        casesResponse,
        gcProfilesResponse
      ] = await Promise.all([
        getTrips(idToken),
        getCases(idToken),
        getGcProfiles(idToken)
      ]);

      setTrips(tripsResponse.trips);
      setCases(casesResponse.cases);

      setGcProfiles(
        gcProfilesResponse.gcProfiles.filter(
          (profile) => profile.status === "active"
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load trip data."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleFieldChange(
    field: keyof TripFormState,
    value: string | boolean
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleNewTrip() {
    setFormData(emptyForm);
    setEditingTripId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleEdit(trip: Trip) {
    setFormData({
      caseId: trip.caseId,
      gcProfileId: trip.gcProfileId,
      tripPurpose: trip.tripPurpose,
      outboundDate: trip.outboundDate.substring(0, 10),
      returnDate: trip.returnDate.substring(0, 10),
      outboundAirport: trip.outboundAirport,
      returnAirport: trip.returnAirport,
      destinationCity: trip.destinationCity ?? "",
      destinationAddress: trip.destinationAddress ?? "",
      hotelProximityPreference:
        trip.hotelProximityPreference ?? "",
      minimumHotelStarRating:
        trip.minimumHotelStarRating?.toString() ?? "",
      budgetDollars: (trip.budgetFilter / 100).toFixed(2),
      companionTraveler: trip.companionTraveler,
      status: trip.status
    });

    setEditingTripId(trip.id);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleCancel() {
    setFormData(emptyForm);
    setEditingTripId(null);
    setShowForm(false);
  }

  function buildRequestPayload(): TripRequest {
    const budgetDollars = Number(formData.budgetDollars);

    if (!Number.isFinite(budgetDollars) || budgetDollars < 0) {
      throw new Error("Budget must be a valid positive amount.");
    }

    if (
      !formData.destinationCity.trim() &&
      !formData.destinationAddress.trim()
    ) {
      throw new Error(
        "Enter either a destination city or destination address."
      );
    }

    if (
      formData.returnDate &&
      formData.outboundDate &&
      formData.returnDate < formData.outboundDate
    ) {
      throw new Error(
        "Return date cannot be before the outbound date."
      );
    }

    return {
      caseId: formData.caseId,
      gcProfileId: formData.gcProfileId,
      tripPurpose: formData.tripPurpose.trim(),
      outboundDate: formData.outboundDate,
      returnDate: formData.returnDate,
      outboundAirport:
        formData.outboundAirport.trim().toUpperCase(),
      returnAirport:
        formData.returnAirport.trim().toUpperCase(),
      destinationCity:
        formData.destinationCity.trim() || undefined,
      destinationAddress:
        formData.destinationAddress.trim() || undefined,
      hotelProximityPreference:
        formData.hotelProximityPreference.trim() || undefined,
      minimumHotelStarRating:
        formData.minimumHotelStarRating === ""
          ? undefined
          : Number(formData.minimumHotelStarRating),
      budgetFilter: Math.round(budgetDollars * 100),
      companionTraveler: formData.companionTraveler,
      status: formData.status
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = buildRequestPayload();

      if (editingTripId) {
        await updateTrip(
          idToken,
          editingTripId,
          payload
        );

        setSuccessMessage("Trip updated successfully.");
      } else {
        await createTrip(idToken, payload);
        setSuccessMessage("Trip created successfully.");
      }

      const response = await getTrips(idToken);
      setTrips(response.trips);

      setFormData(emptyForm);
      setEditingTripId(null);
      setShowForm(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save trip."
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

          <button
            type="button"
            onClick={handleNewTrip}
          >
            + New Trip
          </button>
        </div>

        {successMessage && (
          <p className="trips-success">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="trips-error">
            {errorMessage}
          </p>
        )}

        {showForm && (
          <form
            className="trip-form-card"
            onSubmit={handleSubmit}
          >
            <h2>
              {editingTripId
                ? "Edit Trip"
                : "Create Trip"}
            </h2>

            <div className="trip-form-grid">
              <label>
                Case *
                <select
                  value={formData.caseId}
                  onChange={(event) =>
                    handleFieldChange(
                      "caseId",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a case
                  </option>

                  {cases.map((caseItem) => (
                    <option
                      key={caseItem.id}
                      value={caseItem.id}
                    >
                      {caseItem.caseReferenceId}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                GC Profile *
                <select
                  value={formData.gcProfileId}
                  onChange={(event) =>
                    handleFieldChange(
                      "gcProfileId",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a GC
                  </option>

                  {gcProfiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.legalFirstName}{" "}
                      {profile.legalLastName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Trip Purpose *
                <select
                  value={formData.tripPurpose}
                  onChange={(event) =>
                    handleFieldChange(
                      "tripPurpose",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a purpose
                  </option>
                  <option value="Monitoring">
                    Monitoring
                  </option>
                  <option value="Transfer">
                    Transfer
                  </option>
                  <option value="Delivery">
                    Delivery
                  </option>
                  <option value="Consultation">
                    Consultation
                  </option>
                  <option value="Legal">
                    Legal
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </label>

              <label>
                Budget *
                <div className="currency-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budgetDollars}
                    onChange={(event) =>
                      handleFieldChange(
                        "budgetDollars",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>
              </label>

              <label>
                Outbound Date *
                <input
                  type="date"
                  value={formData.outboundDate}
                  onChange={(event) =>
                    handleFieldChange(
                      "outboundDate",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Return Date *
                <input
                  type="date"
                  min={formData.outboundDate || undefined}
                  value={formData.returnDate}
                  onChange={(event) =>
                    handleFieldChange(
                      "returnDate",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Outbound Airport *
                <input
                  maxLength={10}
                  placeholder="DFW"
                  value={formData.outboundAirport}
                  onChange={(event) =>
                    handleFieldChange(
                      "outboundAirport",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Return Airport *
                <input
                  maxLength={10}
                  placeholder="DFW"
                  value={formData.returnAirport}
                  onChange={(event) =>
                    handleFieldChange(
                      "returnAirport",
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <label>
                Destination City
                <input
                  placeholder="Denver"
                  value={formData.destinationCity}
                  onChange={(event) =>
                    handleFieldChange(
                      "destinationCity",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Destination Address
                <input
                  placeholder="123 Clinic Way"
                  value={formData.destinationAddress}
                  onChange={(event) =>
                    handleFieldChange(
                      "destinationAddress",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Hotel Proximity Preference
                <input
                  placeholder="Within 5 miles"
                  value={
                    formData.hotelProximityPreference
                  }
                  onChange={(event) =>
                    handleFieldChange(
                      "hotelProximityPreference",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Minimum Hotel Star Rating
                <select
                  value={
                    formData.minimumHotelStarRating
                  }
                  onChange={(event) =>
                    handleFieldChange(
                      "minimumHotelStarRating",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    No minimum
                  </option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </label>

              <label className="companion-toggle">
                <input
                  type="checkbox"
                  checked={formData.companionTraveler}
                  onChange={(event) =>
                    handleFieldChange(
                      "companionTraveler",
                      event.target.checked
                    )
                  }
                />

                <span>Companion traveler included</span>
              </label>
            </div>

            <div className="trip-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? "Saving..."
                  : editingTripId
                    ? "Update Trip"
                    : "Create Trip"}
              </button>
            </div>
          </form>
        )}

        {isLoading && !showForm && (
          <p className="trips-loading">
            Loading trips...
          </p>
        )}

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
                <th>Actions</th>
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
                      {trip.outboundDate.substring(0, 10)}
                      {" → "}
                      {trip.returnDate.substring(0, 10)}
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
                      <span className="trip-status">
                        {trip.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="trip-edit-button"
                        onClick={() => handleEdit(trip)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="empty-state"
                    colSpan={10}
                  >
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