import type { CaseResponse } from "../../types/case";
import type { UserResponse } from "../../types/user";
import { isAdmin, isCaseManager } from "../../utils/userRoles";

type CasesTableProps = {
  cases: CaseResponse[];
  user: UserResponse;
  onEdit: (caseItem: CaseResponse) => void;
  onSetBudget: (caseItem: CaseResponse) => void;
};

function formatCurrency(cents: number | null): string {
  return cents === null ? "—" : new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD"
  }).format(cents / 100);
}

export function CasesTable({ cases, user, onEdit, onSetBudget }: CasesTableProps) {
  const admin = isAdmin(user);
  const manager = isCaseManager(user);
  return (
    <div className="case-table-card">
      <table>
        <thead><tr>
          <th>Case Reference</th><th>Case Manager</th><th>Travelers</th>
          <th>Suggested Budget</th><th>Approved Budget</th><th>Status</th>
          {(admin || manager) && <th>Actions</th>}
        </tr></thead>
        <tbody>
          {cases.length ? cases.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.caseReferenceId}</strong></td>
              <td>{item.caseManagerName}</td>
              <td>{item.travelerNames.join(", ") || "—"}</td>
              <td>{formatCurrency(item.suggestedBudgetCents)}</td>
              <td>{formatCurrency(item.approvedBudgetCents)}</td>
              <td><span className={item.status.trim().toLowerCase() === "active" ? "case-status case-status-active" : "case-status case-status-neutral"}>{item.status}</span></td>
              {(admin || manager) && <td><div className="case-row-actions">
                {admin && <button type="button" className="case-table-button" onClick={() => onEdit(item)}>Edit</button>}
                {manager && <button type="button" className="case-table-button case-budget-button" onClick={() => onSetBudget(item)}>{item.approvedBudgetCents === null ? "Set Budget" : "Update Budget"}</button>}
              </div></td>}
            </tr>
          )) : <tr><td className="empty-state" colSpan={admin || manager ? 7 : 6}>{manager ? "No cases are currently assigned to you." : "No active cases found."}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
