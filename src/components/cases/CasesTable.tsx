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
  return cents === null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function CasesTable({ cases, user, onEdit, onSetBudget }: CasesTableProps) {
  const admin = isAdmin(user);
  const manager = isCaseManager(user);
  return (
    <div className="case-table-card">
      <div className="case-table-heading">
        <div><h2>{manager ? "My Cases" : "Case Directory"}</h2><p>{cases.length} {cases.length === 1 ? "case" : "cases"} listed</p></div>
      </div>
      <div className="case-table-scroll">
        <table>
          <thead><tr>
            <th scope="col">Case Reference</th><th scope="col">Case Manager</th><th scope="col">Travelers</th>
            <th scope="col">Suggested Budget</th><th scope="col">Approved Budget</th><th scope="col">Status</th>
            {(admin || manager) && <th scope="col">Actions</th>}
          </tr></thead>
          <tbody>
            {cases.length ? cases.map((item) => (
              <tr key={item.id}>
                <td><strong className="case-reference">{item.caseReferenceId}</strong></td>
                <td>{item.caseManagerName}</td>
                <td className="case-traveler-names" title={item.travelerNames.join(", ")}>{item.travelerNames.join(", ") || "—"}</td>
                <td>{formatCurrency(item.suggestedBudgetCents)}</td>
                <td>{formatCurrency(item.approvedBudgetCents)}</td>
                <td><span className={item.status.trim().toLowerCase() === "active" ? "case-status case-status-active" : "case-status case-status-neutral"}>{item.status}</span></td>
                {(admin || manager) && <td><div className="case-row-actions">
                  <button type="button" className="case-table-button" onClick={() => onEdit(item)}>Edit</button>
                  {manager && <button type="button" className="case-table-button case-budget-button" onClick={() => onSetBudget(item)}>{item.approvedBudgetCents === null ? "Set Budget" : "Update Budget"}</button>}
                </div></td>}
              </tr>
            )) : <tr><td className="empty-state" colSpan={admin || manager ? 7 : 6}>{manager ? "No cases are currently assigned to you." : "No active cases found."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
