import {
  type FormEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import {
  createTrip,
  getTrips,
  sendTripToGc,
  updateTrip
} from "../api/tripApi";

import { getCases } from "../api/caseApi";
import { getGcProfiles } from "../api/gcProfileApi";

import { ConfirmDialog } from "../components/common/ConfirmDialog";

import {
  TripForm,
  type TripFormState
} from "../components/trips/TripForm";

import { TripsTable } from "../components/trips/TripsTable";

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

function createEmptyForm(): TripFormState {
  return {
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
    ipcmApprovalRequired: false,

    status: "Created"
  };
}

function createFormFromTrip(
  trip: Trip
): TripFormState {
  return {
    caseId: trip.caseId,
    gcProfileId: trip.gcProfileId,
    tripPurpose: trip.tripPurpose,

    outboundDate:
      trip.outboundDate?.substring(0, 10) ?? "",

    returnDate:
      trip.returnDate?.substring(0, 10) ?? "",

    outboundAirport: trip.outboundAirport,
    returnAirport: trip.returnAirport,

    destinationCity: trip.destinationCity ?? "",
    destinationAddress:
      trip.destinationAddress ?? "",

    hotelProximityPreference:
      trip.hotelProximityPreference ?? "",

    minimumHotelStarRating:
      trip.minimumHotelStarRating?.toString() ?? "",

    budgetDollars: (
      trip.budgetFilter / 100
    ).toFixed(2),

    companionTraveler: trip.companionTraveler,

    ipcmApprovalRequired:
      trip.ipcmApprovalRequired ?? false,

    status: trip.status
  };
}

function buildRequestPayload(
  formData: TripFormState
): TripRequest {
  const budgetDollars = Number(
    formData.budgetDollars
  );

  if (
    !Number.isFinite(budgetDollars) ||
    budgetDollars <= 0
  ) {
    throw new Error(
      "Budget must be greater than zero."
    );
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
    formData.outboundDate &&
    formData.returnDate &&
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
      formData.destinationAddress.trim() ||
      undefined,

    hotelProximityPreference:
      formData.hotelProximityPreference.trim() ||
      undefined,

    minimumHotelStarRating:
      formData.minimumHotelStarRating === ""
        ? undefined
        : Number(
            formData.minimumHotelStarRating
          ),

    budgetFilter: Math.round(
      budgetDollars * 100
    ),

    companionTraveler:
      formData.companionTraveler,

    ipcmApprovalRequired:
      formData.ipcmApprovalRequired,

    status: formData.status
  };
}

export function TripsPage({
  idToken
}: TripsPageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cases, setCases] = useState<CaseResponse[]>(
    []
  );

  const [gcProfiles, setGcProfiles] = useState<
    GcProfile[]
  >([]);

  const [formData, setFormData] =
    useState<TripFormState>(createEmptyForm());

  const [editingTripId, setEditingTripId] =
    useState<string | null>(null);

  const [tripPendingEmail, setTripPendingEmail] =
    useState<Trip | null>(null);

  const [isSendingTripId, setIsSendingTripId] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isPageLoading, setIsPageLoading] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadTrips = useCallback(async () => {
    const response = await getTrips(idToken);
    setTrips(response.trips);
  }, [idToken]);

  const loadPageData = useCallback(async () => {
    setIsPageLoading(true);
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
          (profile) =>
            profile.status.toLowerCase() === "active"
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load trip data."
      );
    } finally {
      setIsPageLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

  function handleFieldChange<
    Field extends keyof TripFormState
  >(
    field: Field,
    value: TripFormState[Field]
  ): void {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleNewTrip(): void {
    setFormData(createEmptyForm());
    setEditingTripId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleEdit(trip: Trip): void {
    setFormData(createFormFromTrip(trip));
    setEditingTripId(trip.id);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function handleCancelForm(): void {
    setFormData(createEmptyForm());
    setEditingTripId(null);
    setShowForm(false);
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = buildRequestPayload(formData);

      if (editingTripId) {
        await updateTrip(
          idToken,
          editingTripId,
          payload
        );

        setSuccessMessage(
          "Trip updated successfully."
        );
      } else {
        await createTrip(idToken, payload);

        setSuccessMessage(
          "Trip created successfully."
        );
      }

      await loadTrips();

      setFormData(createEmptyForm());
      setEditingTripId(null);
      setShowForm(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save trip."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenSendDialog(
    trip: Trip
  ): void {
    setTripPendingEmail(trip);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleCloseSendDialog(): void {
    if (isSendingTripId) {
      return;
    }

    setTripPendingEmail(null);
  }

  async function handleConfirmSend(): Promise<void> {
    if (!tripPendingEmail) {
      return;
    }

    const trip = tripPendingEmail;

    setIsSendingTripId(trip.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await sendTripToGc(
        idToken,
        trip.id
      );

      setSuccessMessage(
        `Trip selection link sent to ${response.sentTo}.`
      );

      setTripPendingEmail(null);

      await loadTrips();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the trip selection email."
      );
    } finally {
      setIsSendingTripId(null);
    }
  }

  return (
    <main className="trips-page">
      <section className="trips-content">
        <div className="trips-header">
          <div>
            <h1>Trips</h1>

            <p>
              Create and manage travel requests.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNewTrip}
            disabled={isSaving}
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
          <TripForm
            formData={formData}
            cases={cases}
            gcProfiles={gcProfiles}
            isEditing={editingTripId !== null}
            isSaving={isSaving}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
          />
        )}

        {isPageLoading ? (
          <p className="trips-loading">
            Loading trips...
          </p>
        ) : (
          <TripsTable
            trips={trips}
            isSendingTripId={isSendingTripId}
            onEdit={handleEdit}
            onSendToGc={handleOpenSendDialog}
          />
        )}
      </section>

      <ConfirmDialog
        isOpen={tripPendingEmail !== null}
        title="Send trip to GC?"
        message={
          tripPendingEmail
            ? [
                `A secure trip-selection link will be sent to ${tripPendingEmail.gcName}.`,
                "",
                tripPendingEmail.gcEmail,
                "",
                "Any previously active link for this trip will be revoked."
              ].join("\n")
            : ""
        }
        confirmLabel="Send Email"
        isConfirming={
          isSendingTripId !== null
        }
        onConfirm={() => {
          void handleConfirmSend();
        }}
        onCancel={handleCloseSendDialog}
      />
    </main>
  );
}