import type { UserResponse } from "../types/user";
import type { CaseResponse } from "../types/case";
import "./home.css";

type HomePageProps = {
  user: UserResponse;
  cases: CaseResponse[];
  onLogout: () => void;
};

export function HomePage({ user, cases, onLogout }: HomePageProps) {
  function formatCurrencyCents(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount / 100);
  }

  return (
    <main className="home-page">
      <nav className="home-navbar">
        <div className="home-brand">Aurem</div>

        <div className="home-user">
          <span>
            Welcome {user.role}, {user.firstName}
          </span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <section className="home-content">
        <div className="home-header">
          <h1>Active Cases</h1>
          <p>Cases currently available based on your role and assignments.</p>
        </div>

        <div className="case-table-card">
          <table>
            <thead>
              <tr>
                <th>Case Reference</th>
                <th>Company</th>
                <th>GP User</th>
                <th>IP User</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {cases.length > 0 ? (
                cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>{caseItem.caseReferenceId}</td>
                    <td>{caseItem.companyName}</td>
                    <td>{caseItem.gpName}</td>
                    <td>{caseItem.ipName}</td>
                    <td>{formatCurrencyCents(caseItem.budget)}</td>
                    <td>
                      <span className="case-status">{caseItem.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={6}>
                    No active cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}