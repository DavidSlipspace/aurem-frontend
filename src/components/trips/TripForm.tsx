import type { FormEvent } from "react";

import type { CaseResponse } from "../../types/case";
import type { GcProfile } from "../../types/gcProfile";

export type TripFormState = {
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
  ipcmApprovalRequired: boolean;

  status: string;
};

type TripFormProps = {
  formData: TripFormState;
  cases: CaseResponse[];
  gcProfiles: GcProfile[];
  isEditing: boolean;
  isSaving: boolean;

  onFieldChange: <
    Field extends keyof TripFormState
  >(
    field: Field,
    value: TripFormState[Field]
  ) => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;

  onCancel: () => void;
};

export function TripForm({
  formData,
  cases,
  gcProfiles,
  isEditing,
  isSaving,
  onFieldChange,
  onSubmit,
  onCancel
}: TripFormProps) {
  return (
    <form
      className="trip-form-card"
      onSubmit={onSubmit}
    >
      <h2>
        {isEditing ? "Edit Trip" : "Create Trip"}
      </h2>

      <div className="trip-form-grid">
        <label>
          Case *
          <select
            value={formData.caseId}
            onChange={(event) =>
              onFieldChange(
                "caseId",
                event.target.value
              )
            }
            required
          >
            <option value="">Select a case</option>

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
              onFieldChange(
                "gcProfileId",
                event.target.value
              )
            }
            required
          >
            <option value="">Select a GC</option>

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
              onFieldChange(
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

            <option value="Legal">Legal</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Budget *
          <div className="currency-input">
            <span>$</span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.budgetDollars}
              onChange={(event) =>
                onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
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
              onFieldChange(
                "minimumHotelStarRating",
                event.target.value
              )
            }
          >
            <option value="">No minimum</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </label>

        <label className="trip-checkbox-field">
          <input
            type="checkbox"
            checked={formData.companionTraveler}
            onChange={(event) =>
              onFieldChange(
                "companionTraveler",
                event.target.checked
              )
            }
          />

          <span>Companion traveler included</span>
        </label>

        <label className="trip-checkbox-field">
          <input
            type="checkbox"
            checked={
              formData.ipcmApprovalRequired
            }
            onChange={(event) =>
              onFieldChange(
                "ipcmApprovalRequired",
                event.target.checked
              )
            }
          />

          <span>
            Require IPCM approval before purchase
          </span>
        </label>
      </div>

      <div className="trip-form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update Trip"
              : "Create Trip"}
        </button>
      </div>
    </form>
  );
}