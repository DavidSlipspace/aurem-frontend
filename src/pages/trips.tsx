import {
  type FormEvent,
  useCallback,
  useEffect,
  useState
} from "react";

import {
  createTrip,
  getTrips,
  sendTripToTraveler,
  updateTrip
} from "../api/tripApi";

import {
  getCases
} from "../api/caseApi";

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
  CaseResponse
} from "../types/case";

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

import "./trips.css";

type TripsPageProps = {
  idToken: string;

  user:
    UserResponse;
};

function createEmptyForm():
  TripFormState {
  return {
    caseId:
      "",

    travelerProfileId:
      "",

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

    destinationCity:
      "",

    destinationAddress:
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

    status:
      "Created"
  };
}

function createFormFromTrip(
  trip: Trip
): TripFormState {
  return {
    caseId:
      trip.caseId,

    travelerProfileId:
      trip.travelerProfileId,

    ipcmUserId:
      trip.ipcmUserId ?? "",

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

    destinationCity:
      trip.destinationCity ??
      "",

    destinationAddress:
      trip.destinationAddress ??
      "",

    hotelProximityPreference:
      trip.hotelProximityPreference ??
      "",

    minimumHotelStarRating:
      trip.minimumHotelStarRating
        ?.toString() ??
      "",

    budgetDollars:
      (
        trip.budgetFilter /
        100
      ).toFixed(
        2
      ),

    companionTraveler:
      trip.companionTraveler,

    ipcmApprovalRequired:
      trip.ipcmApprovalRequired,

    status:
      trip.status
  };
}

function buildRequestPayload(
  formData:
    TripFormState
): TripRequest {
  const budgetDollars =
    Number(
      formData.budgetDollars
    );

  if (
    !formData.caseId
  ) {
    throw new Error(
      "Select a case."
    );
  }

  if (
    !formData.travelerProfileId
  ) {
    throw new Error(
      "Select a traveler."
    );
  }

  if (
    !formData.ipcmUserId
  ) {
    throw new Error(
      "Select an IPCM."
    );
  }

  if (
    !Number.isFinite(
      budgetDollars
    ) ||
    budgetDollars <=
      0
  ) {
    throw new Error(
      "Budget must be greater than zero."
    );
  }

  if (
    !formData
      .destinationCity
      .trim() &&
    !formData
      .destinationAddress
      .trim()
  ) {
    throw new Error(
      "Enter either a destination city or destination address."
    );
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

  const minimumHotelStarRating =
    formData.minimumHotelStarRating ===
    ""
      ? undefined
      : Number(
          formData.minimumHotelStarRating
        );

  return {
    caseId:
      formData.caseId,

    travelerProfileId:
      formData.travelerProfileId,

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

    destinationCity:
      formData.destinationCity
        .trim() ||
      undefined,

    destinationAddress:
      formData.destinationAddress
        .trim() ||
      undefined,

    hotelProximityPreference:
      formData.hotelProximityPreference
        .trim() ||
      undefined,

    minimumHotelStarRating,

    budgetFilter:
      Math.round(
        budgetDollars *
          100
      ),

    companionTraveler:
      formData.companionTraveler,

    ipcmApprovalRequired:
      formData.ipcmApprovalRequired,

    status:
      formData.status
  };
}

export function TripsPage({
  idToken,
  user
}: TripsPageProps) {
  const canManageTrips =
    user.role ===
      "Admin" ||
    user.role ===
      "Case Manager";

  const isIpcm =
    user.role ===
    "IPCM";

  const [
    trips,
    setTrips
  ] =
    useState<
      Trip[]
    >([]);

  const [
    cases,
    setCases
  ] =
    useState<
      CaseResponse[]
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
              casesResponse,
              travelerProfilesResponse,
              ipcmsResponse
            ] =
              await Promise.all([
                getTrips(
                  idToken
                ),

                getCases(
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

            setCases(
              casesResponse.cases
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

          setCases(
            []
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

  function handleFieldChange<
    Field extends
      keyof TripFormState
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

    setFormData(
      createFormFromTrip(
        trip
      )
    );

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
      const payload =
        buildRequestPayload(
          formData
        );

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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the trip selection email."
      );
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
              cases={
                cases
              }
              travelerProfiles={
                travelerProfiles
              }
              ipcms={
                ipcms
              }
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

        {isPageLoading ? (
          <p className="trips-loading">
            {isIpcm
              ? "Loading your trips..."
              : "Loading trips..."}
          </p>
        ) : (
          <TripsTable
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