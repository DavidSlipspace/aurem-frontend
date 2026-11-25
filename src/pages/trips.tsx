import { NewTripTravelerDialog } from "../components/trips/NewTripTravelerDialog";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  createTrip,
  getTrips,
  sendTripToTraveler,
  updateTrip
} from "../api/tripApi";



import {
  getTravelerProfiles
} from "../api/travelerProfileApi";

import {
  getIpcms
} from "../api/ipcmApi";

import {
  ConfirmDialog
} from "../components/common/ConfirmDialog";

import {
  TripForm,
  type TripFormState
} from "../components/trips/TripForm";

import {
  TripsTable
} from "../components/trips/TripsTable";



import type {
  IpcmDirectoryItem
} from "../types/ipcm";

import type {
  TravelerProfile
} from "../types/travelerProfile";

import type {
  Trip,
  TripRequest
} from "../types/trip";

import type {
  UserResponse
} from "../types/user";

import { loadAirports } from "../components/trips/airportData";

import { isAdmin as hasAdminRole, isCaseManager } from "../utils/userRoles";

import "./trips.css";

type TripsPageProps = {
  idToken: string;

  user:
    UserResponse;
};

function createEmptyForm():
  TripFormState {
  return {

    travelerProfileIds:
      [],

    ipcmUserId:
      "",

    tripPurpose:
      "",

    outboundDate:
      "",

    returnDate:
      "",

    outboundAirport:
      "",

    returnAirport:
      "",

    returnDepartureAirport: "",
    returnArrivalAirport: "",
    differentReturnDeparture: false,
    differentReturnArrival: false,

    destinationCity:
      "",

    clinicZipCode:
      "",

    hotelProximityPreference:
      "",

    minimumHotelStarRating:
      "",

    budgetDollars:
      "",

    companionTraveler:
      false,

    ipcmApprovalRequired:
      false,
    approvingCaseManagerUserId: "",

    status:
      "Created"
  };
}

function createFormFromTrip(
  trip: Trip
): TripFormState {
  return {

    travelerProfileIds:
      trip.travelerProfileIds?.length ? trip.travelerProfileIds : [trip.travelerProfileId].filter(Boolean),

    ipcmUserId:
      trip.ipcmUserId ??
      "",

    tripPurpose:
      trip.tripPurpose,

    outboundDate:
      trip.outboundDate
        ?.substring(
          0,
          10
        ) ?? "",

    returnDate:
      trip.returnDate
        ?.substring(
          0,
          10
        ) ?? "",

    outboundAirport:
      trip.outboundAirport,

    returnAirport:
      trip.returnAirport,

    returnDepartureAirport: trip.returnDepartureAirport ?? "",
    returnArrivalAirport: trip.returnArrivalAirport ?? "",
    differentReturnDeparture: !!trip.returnDepartureAirport,
    differentReturnArrival: !!trip.returnArrivalAirport,

    destinationCity:
      trip.destinationCity ??
      "",

    clinicZipCode:
      trip.clinicZipCode ??
      "",

    hotelProximityPreference:
      trip.hotelProximityPreference ??
      "",

    minimumHotelStarRating:
      trip.minimumHotelStarRating
        ?.toString() ??
      "",


    budgetDollars:
      trip.budgetFilter >
      0
        ? (
            trip.budgetFilter /
            100
          ).toFixed(
            2
          )
        : "",

    companionTraveler:
      trip.companionTraveler,

    ipcmApprovalRequired:
      trip.ipcmApprovalRequired,
    approvingCaseManagerUserId: trip.approvingCaseManagerUserId ?? "",

    status:
      trip.status
  };
}

function buildRequestPayload(
  formData:
    TripFormState
): TripRequest {


  if (
    formData.travelerProfileIds.length === 0
  ) {
    throw new Error(
      "Select at least one traveler."
    );
  }

  if (
    !formData.ipcmUserId
  ) {
    throw new Error(
      "Select a case manager."
    );
  }

  if (formData.ipcmApprovalRequired && !formData.approvingCaseManagerUserId) throw new Error("Select an approving Case Manager.");
  const budgetValue = formData.budgetDollars.trim();
  if (budgetValue && ( !Number.isFinite(Number(budgetValue)) || Number(budgetValue) < 0)) {
    throw new Error("Enter a valid non-negative trip budget.");
  }
  if (formData.clinicZipCode.trim() && !/^\d{5}(?:-\d{4})?$/.test(formData.clinicZipCode.trim())) {
    throw new Error("Destination ZIP must be a valid US ZIP code.");
  }
  if (!formData.destinationCity.trim()) {
    throw new Error("Select a destination airport with a recognized city.");
  }

  if (
    formData.outboundDate &&
    formData.returnDate &&
    formData.returnDate <
      formData.outboundDate
  ) {
    throw new Error(
      "Return date cannot be before the outbound date."
    );
  }

  for (const [enabled, code, label] of [
    [formData.differentReturnDeparture, formData.returnDepartureAirport, "Return departure airport"],
    [formData.differentReturnArrival, formData.returnArrivalAirport, "Return arrival airport"]
  ] as const) {
    if (enabled && !/^[A-Z]{3}$/.test(code.trim().toUpperCase())) {
      throw new Error(`Select a valid ${label.toLowerCase()}.`);
    }
  }

  const minimumHotelStarRating =
    formData.minimumHotelStarRating ===
    ""
      ? undefined
      : Number(
          formData.minimumHotelStarRating
        );

  return {

    travelerProfileId:
      formData.travelerProfileIds[0],

    travelerProfileIds: [...formData.travelerProfileIds],

    ipcmUserId:
      formData.ipcmUserId,

    tripPurpose:
      formData.tripPurpose
        .trim(),

    outboundDate:
      formData.outboundDate,

    returnDate:
      formData.returnDate,

    outboundAirport:
      formData.outboundAirport
        .trim()
        .toUpperCase(),

    returnAirport:
      formData.returnAirport
        .trim()
        .toUpperCase(),

    returnDepartureAirport: formData.differentReturnDeparture
      ? formData.returnDepartureAirport.trim().toUpperCase()
      : null,

    returnArrivalAirport: formData.differentReturnArrival
      ? formData.returnArrivalAirport.trim().toUpperCase()
      : null,

    destinationCity:
      formData.destinationCity
        .trim() ||
      undefined,

    clinicZipCode: formData.clinicZipCode.trim() || undefined,

    hotelProximityPreference:
      formData.hotelProximityPreference
        .trim() ||
      undefined,

    minimumHotelStarRating,

    budgetFilter: budgetValue ? Math.round(Number(budgetValue) * 100) : null,

    companionTraveler:
      formData.companionTraveler,

    ipcmApprovalRequired:
      formData.ipcmApprovalRequired,
    approvingCaseManagerUserId: formData.ipcmApprovalRequired ? formData.approvingCaseManagerUserId : null,

    status:
      formData.status
  };
}

export function TripsPage({
  idToken,
  user
}: TripsPageProps) {
  const [showNewTraveler, setShowNewTraveler] = useState(false);
  const isAdmin = hasAdminRole(user);
  const isIpcm = isCaseManager(user);
  const canManageTrips = isAdmin || isIpcm;

  const [
    trips,
    setTrips
  ] =
    useState<
      Trip[]
    >([]);



  const [
    travelerProfiles,
    setTravelerProfiles
  ] =
    useState<
      TravelerProfile[]
    >([]);

  const [
    ipcms,
    setIpcms
  ] =
    useState<
      IpcmDirectoryItem[]
    >([]);

  const [
    formData,
    setFormData
  ] =
    useState<
      TripFormState
    >(
      createEmptyForm()
    );

  const [
    editingTripId,
    setEditingTripId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    tripPendingEmail,
    setTripPendingEmail
  ] =
    useState<
      Trip |
      null
    >(null);

  const [
    isSendingTripId,
    setIsSendingTripId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    showForm,
    setShowForm
  ] =
    useState(
      false
    );

  const [
    isPageLoading,
    setIsPageLoading
  ] =
    useState(
      false
    );

  const [
    isSaving,
    setIsSaving
  ] =
    useState(
      false
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState(
      ""
    );

  const [
    successMessage,
    setSuccessMessage
  ] =
    useState(
      ""
    );

  const loadTrips =
    useCallback(
      async () => {
        const response =
          await getTrips(
            idToken
          );

        setTrips(
          response.trips
        );
      },
      [
        idToken
      ]
    );

  const loadPageData =
    useCallback(
      async () => {
        setIsPageLoading(
          true
        );

        setErrorMessage(
          ""
        );

        try {
          if (
            canManageTrips
          ) {
            const [
              tripsResponse,
              travelerProfilesResponse,
              ipcmsResponse
            ] =
              await Promise.all([
                getTrips(
                  idToken
                ),



                getTravelerProfiles(
                  idToken
                ),

                getIpcms(
                  idToken
                )
              ]);

            setTrips(
              tripsResponse.trips
            );

            setTravelerProfiles(
              travelerProfilesResponse
                .travelerProfiles
                .filter(
                  (
                    profile
                  ) =>
                    profile.status
                      .toLowerCase() ===
                    "active"
                )
            );

            setIpcms(
              ipcmsResponse.ipcms.filter(
                (
                  ipcm
                ) =>
                  ipcm.type ===
                    "user" &&
                  ipcm.status ===
                    "active"
              )
            );

            return;
          }

          const tripsResponse =
            await getTrips(
              idToken
            );

          setTrips(
            tripsResponse.trips
          );

          setTravelerProfiles(
            []
          );

          setIpcms(
            []
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load trip data."
          );
        } finally {
          setIsPageLoading(
            false
          );
        }
      },
      [
        canManageTrips,
        idToken
      ]
    );

  useEffect(
    () => {
      void loadPageData();
    },
    [
      loadPageData
    ]
  );

  // Ignore stale airport lookups and preserve manually edited destination cities.
  const destinationEditVersion = useRef(0);

  function handleFieldChange<
    Field extends keyof TripFormState
  >(
    field:
      Field,

    value:
      TripFormState[Field]
  ): void {
    if (
      !canManageTrips
    ) {
      return;
    }

    if (field === "ipcmUserId" && !isAdmin) return;
    if (field === "ipcmApprovalRequired") { setFormData(current=>({...current, ipcmApprovalRequired: Boolean(value), approvingCaseManagerUserId: value ? current.approvingCaseManagerUserId : ""})); return; }
    if (field === "destinationCity") {
      destinationEditVersion.current += 1;
    }

    if (field === "returnAirport") {
      const code = String(value).trim().toUpperCase();
      const lookupVersion = ++destinationEditVersion.current;
      setFormData((current) => ({ ...current, returnAirport: code, destinationCity: "" }));
      if (code) {
        void loadAirports().then((airports) => {
          const airport = airports.find((item) => item.code === code);
          if (!airport?.city || destinationEditVersion.current !== lookupVersion) return;
          setFormData((current) => current.returnAirport === code
            ? { ...current, destinationCity: airport.city }
            : current);
        }).catch(() => { /* Airport autocomplete handles availability errors. */ });
      }
      return;
    }


    if (field === "differentReturnArrival" || field === "differentReturnDeparture") {
      setFormData((current) => ({
        ...current,
        [field]: value,
        ...(field === "differentReturnArrival" && !value ? { returnArrivalAirport: "" } : {}),
        ...(field === "differentReturnDeparture" && !value ? { returnDepartureAirport: "" } : {})
      }));
      return;
    }



    setFormData(
      (
        current
      ) => ({
        ...current,

        [field]:
          value
      })
    );
  }

  function handleNewTrip():
    void {
    if (
      !canManageTrips
    ) {
      return;
    }

    setFormData(
      createEmptyForm()
    );

    setEditingTripId(
      null
    );

    setShowForm(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );
  }

  function handleEdit(
    trip:
      Trip
  ): void {
    if (
      !canManageTrips
    ) {
      return;
    }

    setFormData(createFormFromTrip(trip));

    setEditingTripId(
      trip.id
    );

    setShowForm(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth"
    });
  }

  function handleCancelForm():
    void {
    setFormData(
      createEmptyForm()
    );

    setEditingTripId(
      null
    );

    setShowForm(
      false
    );

    setErrorMessage(
      ""
    );
  }

  async function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >
  ): Promise<void> {
    event.preventDefault();

    if (
      !canManageTrips
    ) {
      return;
    }

    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const payload = buildRequestPayload({...formData, ipcmUserId: isAdmin ? formData.ipcmUserId : user.id});

      if (
        editingTripId
      ) {
        await updateTrip(
          idToken,
          editingTripId,
          payload
        );

        setSuccessMessage(
          "Trip updated successfully."
        );
      } else {
        await createTrip(
          idToken,
          payload
        );

        setSuccessMessage(
          "Trip created successfully."
        );
      }

      await loadTrips();

      setFormData(
        createEmptyForm()
      );

      setEditingTripId(
        null
      );

      setShowForm(
        false
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save trip."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function handleOpenSendDialog(
    trip:
      Trip
  ): void {
    if (
      !canManageTrips
    ) {
      return;
    }

    setTripPendingEmail(
      trip
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );
  }

  function handleCloseSendDialog():
    void {
    if (
      isSendingTripId
    ) {
      return;
    }

    setTripPendingEmail(
      null
    );
  }

  async function handleConfirmSend():
    Promise<void> {
    if (
      !tripPendingEmail ||
      !canManageTrips
    ) {
      return;
    }

    const trip =
      tripPendingEmail;

    setIsSendingTripId(
      trip.id
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await sendTripToTraveler(
          idToken,
          trip.id
        );

      setSuccessMessage(
        `Trip selection link sent to ${response.sentTo}.`
      );

      setTripPendingEmail(
        null
      );

      await loadTrips();
    } catch (
      error
    ) {
      setTripPendingEmail(
        null
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the trip selection email."
      );

      window.scrollTo({
        top:
          0,

        behavior:
          "smooth"
      });
    } finally {
      setIsSendingTripId(
        null
      );
    }
  }

  return (
    <main className="trips-page">
      <section className="trips-content">
        <div className="trips-header">
          <div>
            <h1>
              {isIpcm
                ? "My Trips"
                : "Trips"}
            </h1>

            <p>
              {isIpcm
                ? "View travel requests assigned to you."
                : "Create and manage travel requests."}
            </p>
          </div>

          {canManageTrips && (
            <button
              type="button"
              onClick={
                handleNewTrip
              }
              disabled={
                isSaving
              }
            >
              + New Trip
            </button>
          )}
        </div>

        {successMessage && (
          <p className="trips-success">
            {
              successMessage
            }
          </p>
        )}

        {errorMessage && (
          <p className="trips-error">
            {
              errorMessage
            }
          </p>
        )}

        {canManageTrips &&
          showForm && (
            <TripForm
              formData={
                formData
              }
              onNewTraveler={() => setShowNewTraveler(true)}
              isAdmin={isAdmin}
              travelerProfiles={
                travelerProfiles
              }
              ipcms={ipcms}
              isEditing={
                editingTripId !==
                null
              }
              isSaving={
                isSaving
              }
              onFieldChange={
                handleFieldChange
              }
              onSubmit={
                handleSubmit
              }
              onCancel={
                handleCancelForm
              }
            />
          )}

        {canManageTrips && showForm && showNewTraveler && (
          <NewTripTravelerDialog idToken={idToken} onCancel={() => setShowNewTraveler(false)} onCreated={(profile) => {
            setTravelerProfiles(current => [...current.filter(p => p.id !== profile.id), profile]);
            setFormData(current => ({...current, travelerProfileIds: [...new Set([...current.travelerProfileIds, profile.id])]}));
            setShowNewTraveler(false);
          }} />
        )}

        {isPageLoading ? (
          <p className="trips-loading">
            {isIpcm
              ? "Loading your trips..."
              : "Loading trips..."}
          </p>
        ) : (
          <TripsTable
            currentUserId={user.id}
            isAdmin={isAdmin}
            trips={
              trips
            }
            canManage={
              canManageTrips
            }
            isSendingTripId={
              isSendingTripId
            }
            onEdit={
              handleEdit
            }
            onSendToTraveler={
              handleOpenSendDialog
            }
          />
        )}
      </section>

      {canManageTrips && (
        <ConfirmDialog
          isOpen={
            tripPendingEmail !==
            null
          }
          title="Send trip to Traveler?"
          message={
            tripPendingEmail
              ? [
                  `A secure trip-selection link will be sent to ${tripPendingEmail.travelerName}.`,
                  "",
                  tripPendingEmail.travelerEmail,
                  "",
                  "Any previously active link for this trip will be revoked."
                ].join(
                  "\n"
                )
              : ""
          }
          confirmLabel="Send Email"
          isConfirming={
            isSendingTripId !==
            null
          }
          onConfirm={() => {
            void handleConfirmSend();
          }}
          onCancel={
            handleCloseSendDialog
          }
        />
      )}
    </main>
  );
}