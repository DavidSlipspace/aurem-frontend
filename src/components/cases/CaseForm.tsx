import type {
  FormEvent
} from "react";

import type {
  CaseOptionsResponse
} from "../../types/case";

export type CaseFormState = {
  caseReferenceId:
    string;

  caseManagerUserId:
    string;

  travelerProfileIds:
    string[];

  suggestedBudgetDollars:
    string;

  status:
    string;
};

type CaseFormProps = {
  formData:
    CaseFormState;

  options:
    CaseOptionsResponse;

  isEditing:
    boolean;

  isSaving:
    boolean;

  onFieldChange: <
    Field extends
      keyof CaseFormState
  >(
    field: Field,
    value:
      CaseFormState[Field]
  ) => void;

  onSubmit: (
    event:
      FormEvent<HTMLFormElement>
  ) => void;

  onCancel:
    () => void;
};

function getUserLabel(
  firstName: string,
  lastName: string,
  email: string
): string {
  const fullName =
    `${firstName} ${lastName}`
      .trim();

  return (
    `${fullName} — ${email}`
  );
}

function getTravelerLabel(
  firstName: string,
  middleName:
    | string
    | null,
  lastName: string,
  email: string
): string {
  const fullName = [
    firstName,
    middleName,
    lastName
  ]
    .filter(Boolean)
    .join(" ");

  return (
    `${fullName} — ${email}`
  );
}

export function CaseForm({
  formData,
  options,
  isEditing,
  isSaving,
  onFieldChange,
  onSubmit,
  onCancel
}: CaseFormProps) {
  return (
    <form
      className="case-form-card"
      onSubmit={
        onSubmit
      }
    >
      <div className="case-form-heading">
        <div>
          <h2>
            {isEditing
              ? "Edit Case"
              : "Create Case"}
          </h2>

          <p>
            Assign the Case
            Manager and travelers
            associated with this
            case. The Case Manager
            will set the final
            approved budget after
            assignment.
          </p>
        </div>
      </div>

      <div className="case-form-grid">
        <label>
          Case Reference *

          <input
            value={
              formData
                .caseReferenceId
            }
            onChange={(
              event
            ) =>
              onFieldChange(
                "caseReferenceId",
                event.target
                  .value
              )
            }
            maxLength={
              50
            }
            placeholder="CASE-2026-001"
            required
          />
        </label>

        <label>
          Status *

          <select
            value={
              formData.status
            }
            onChange={(
              event
            ) =>
              onFieldChange(
                "status",
                event.target
                  .value
              )
            }
            required
          >
            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </label>

        <label>
          Case Manager *

          <select
            value={
              formData
                .caseManagerUserId
            }
            onChange={(
              event
            ) =>
              onFieldChange(
                "caseManagerUserId",
                event.target
                  .value
              )
            }
            required
          >
            <option value="">
              Select a case manager
            </option>

            {options.caseManagers.map(
              (
                caseManager
              ) => (
                <option
                  key={
                    caseManager.id
                  }
                  value={
                    caseManager.id
                  }
                >
                  {getUserLabel(
                    caseManager.firstName,
                    caseManager.lastName,
                    caseManager.email
                  )}
                </option>
              )
            )}
          </select>

          <small>
            The Case Manager is
            the IPCM assigned to
            this case.
          </small>
        </label>

        <label>
          Travelers *

          <select
            multiple
            value={
              formData
                .travelerProfileIds
            }
            size={
              Math.min(
                Math.max(
                  options
                    .travelers
                    .length,
                  3
                ),
                6
              )
            }
            onChange={(
              event
            ) => {
              const selectedIds =
                Array.from(
                  event
                    .currentTarget
                    .selectedOptions
                ).map(
                  (
                    option
                  ) =>
                    option.value
                );

              onFieldChange(
                "travelerProfileIds",
                selectedIds
              );
            }}
            required
          >
            {options.travelers.map(
              (
                traveler
              ) => (
                <option
                  key={
                    traveler.id
                  }
                  value={
                    traveler.id
                  }
                >
                  {getTravelerLabel(
                    traveler
                      .legalFirstName,
                    traveler
                      .legalMiddleName,
                    traveler
                      .legalLastName,
                    traveler.email
                  )}
                </option>
              )
            )}
          </select>

          <small>
            Select one or more
            travelers. Hold Ctrl
            on Windows or Command
            on Mac to select
            multiple travelers.
          </small>
        </label>

        <label>
          Suggested Budget

          <div className="case-currency-input">
            <span>
              $
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                formData
                  .suggestedBudgetDollars
              }
              onChange={(
                event
              ) =>
                onFieldChange(
                  "suggestedBudgetDollars",
                  event.target
                    .value
                )
              }
              placeholder="Optional"
            />
          </div>

          <small>
            Optional guidance only.
            The assigned Case
            Manager sets the
            approved budget.
          </small>
        </label>
      </div>

      <div className="case-form-actions">
        <button
          type="button"
          className="case-secondary-button"
          onClick={
            onCancel
          }
          disabled={
            isSaving
          }
        >
          Cancel
        </button>

        <button
          type="submit"
          className="case-primary-button"
          disabled={
            isSaving
          }
        >
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Update Case"
              : "Create Case"}
        </button>
      </div>
    </form>
  );
}