import {
  type FormEvent,
  useEffect,
  useState
} from "react";

import type {
  CaseResponse
} from "../../types/case";

type CaseBudgetFormProps = {
  caseItem:
    CaseResponse;

  isSaving:
    boolean;

  onSave: (
    approvedBudgetCents:
      number
  ) => Promise<void>;

  onCancel:
    () => void;
};

function centsToDollars(
  cents:
    | number
    | null
): string {
  if (
    cents === null
  ) {
    return "";
  }

  return (
    cents / 100
  ).toFixed(
    2
  );
}

function formatCurrency(
  cents:
    | number
    | null
): string {
  if (
    cents === null
  ) {
    return "Not set";
  }

  return new Intl
    .NumberFormat(
      "en-US",
      {
        style:
          "currency",

        currency:
          "USD"
      }
    )
    .format(
      cents / 100
    );
}

export function CaseBudgetForm({
  caseItem,
  isSaving,
  onSave,
  onCancel
}: CaseBudgetFormProps) {
  const [
    budgetDollars,
    setBudgetDollars
  ] =
    useState(
      centsToDollars(
        caseItem
          .approvedBudgetCents
      )
    );

  useEffect(
    () => {
      setBudgetDollars(
        centsToDollars(
          caseItem
            .approvedBudgetCents
        )
      );
    },
    [
      caseItem
        .approvedBudgetCents
    ]
  );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const dollars =
      Number(
        budgetDollars
      );

    if (
      !Number.isFinite(
        dollars
      ) ||
      dollars < 0
    ) {
      return;
    }

    const cents =
      Math.round(
        dollars *
          100
      );

    await onSave(
      cents
    );
  }

  return (
    <form
      className="case-budget-card"
      onSubmit={
        handleSubmit
      }
    >
      <div className="case-budget-heading">
        <div>
          <h2>
            Set Case Budget
          </h2>

          <p>
            {caseItem
              .caseReferenceId}
          </p>
        </div>
      </div>

      <div className="case-budget-summary">
        <div>
          <span>
            Admin suggested
          </span>

          <strong>
            {formatCurrency(
              caseItem
                .suggestedBudgetCents
            )}
          </strong>
        </div>

        <div>
          <span>
            Current approved
          </span>

          <strong>
            {formatCurrency(
              caseItem
                .approvedBudgetCents
            )}
          </strong>
        </div>
      </div>

      <label className="case-budget-field">
        Approved Budget *

        <div className="case-currency-input">
          <span>
            $
          </span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={
              budgetDollars
            }
            onChange={(
              event
            ) =>
              setBudgetDollars(
                event.target
                  .value
              )
            }
            required
          />
        </div>
      </label>

      <p className="case-budget-help">
        This is the IPCM-approved
        case budget and will
        ultimately be used when
        enforcing travel funding
        and virtual-card limits.
      </p>

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
            : "Save Budget"}
        </button>
      </div>
    </form>
  );
}