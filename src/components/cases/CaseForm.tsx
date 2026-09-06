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

  ipcmUserId:
    string;

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
            Assign the operational
            owners for this case.
            The IPCM will set the
            final approved budget
            after assignment.
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
        </label>

        <label>
          IPCM *

          <select
            value={
              formData
                .ipcmUserId
            }
            onChange={(
              event
            ) =>
              onFieldChange(
                "ipcmUserId",
                event.target
                  .value
              )
            }
            required
          >
            <option value="">
              Select an IPCM
            </option>

            {options.ipcms.map(
              (
                ipcm
              ) => (
                <option
                  key={
                    ipcm.id
                  }
                  value={
                    ipcm.id
                  }
                >
                  {getUserLabel(
                    ipcm.firstName,
                    ipcm.lastName,
                    ipcm.email
                  )}
                </option>
              )
            )}
          </select>
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
            The assigned IPCM sets
            the approved budget.
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