import type {
  CaseResponse
} from "../../types/case";

import type {
  UserResponse
} from "../../types/user";

type CasesTableProps = {
  cases:
    CaseResponse[];

  user:
    UserResponse;

  onEdit: (
    caseItem:
      CaseResponse
  ) => void;

  onSetBudget: (
    caseItem:
      CaseResponse
  ) => void;
};

function formatCurrency(
  cents:
    | number
    | null
): string {
  if (
    cents === null
  ) {
    return "—";
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

function getStatusClass(
  status: string
): string {
  const normalized =
    status
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "active"
  ) {
    return (
      "case-status " +
      "case-status-active"
    );
  }

  return (
    "case-status " +
    "case-status-neutral"
  );
}

export function CasesTable({
  cases,
  user,
  onEdit,
  onSetBudget
}: CasesTableProps) {
  const isAdmin =
    user.role ===
    "Admin";

  const isIpcm =
    user.role ===
    "IPCM";

  const showActions =
    isAdmin ||
    isIpcm;

  return (
    <div className="case-table-card">
      <table>
        <thead>
          <tr>
            <th>
              Case Reference
            </th>

            <th>
              Case Manager
            </th>

            <th>
              IPCM
            </th>

            <th>
              Suggested Budget
            </th>

            <th>
              Approved Budget
            </th>

            <th>
              Status
            </th>

            {showActions && (
              <th>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {cases.length >
          0 ? (
            cases.map(
              (
                caseItem
              ) => (
                <tr
                  key={
                    caseItem.id
                  }
                >
                  <td>
                    <strong>
                      {
                        caseItem
                          .caseReferenceId
                      }
                    </strong>
                  </td>

                  <td>
                    {
                      caseItem
                        .caseManagerName
                    }
                  </td>

                  <td>
                    {
                      caseItem
                        .ipcmName
                    }
                  </td>

                  <td>
                    {formatCurrency(
                      caseItem
                        .suggestedBudgetCents
                    )}
                  </td>

                  <td>
                    {formatCurrency(
                      caseItem
                        .approvedBudgetCents
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        getStatusClass(
                          caseItem
                            .status
                        )
                      }
                    >
                      {
                        caseItem
                          .status
                      }
                    </span>
                  </td>

                  {showActions && (
                    <td>
                      <div className="case-row-actions">
                        {isAdmin && (
                          <button
                            type="button"
                            className="case-table-button"
                            onClick={() =>
                              onEdit(
                                caseItem
                              )
                            }
                          >
                            Edit
                          </button>
                        )}

                        {isIpcm && (
                          <button
                            type="button"
                            className="case-table-button case-budget-button"
                            onClick={() =>
                              onSetBudget(
                                caseItem
                              )
                            }
                          >
                            {caseItem
                              .approvedBudgetCents ===
                            null
                              ? "Set Budget"
                              : "Update Budget"}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                className="empty-state"
                colSpan={
                  showActions
                    ? 7
                    : 6
                }
              >
                {isIpcm
                  ? "No cases are currently assigned to you."
                  : "No active cases found."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}