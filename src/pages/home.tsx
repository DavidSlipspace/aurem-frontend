import type { CaseResponse } from "../types/case";
import "./home.css";

type HomePageProps = {
  cases: CaseResponse[];
};

export function HomePage({ cases }: HomePageProps) {
  return (
    <main className="home-page">
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
                <th>Case Manager</th>
                <th>IPCM</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {cases.length > 0 ? (
                cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>{caseItem.caseReferenceId}</td>
                    <td>{caseItem.caseManagerName}</td>
                    <td>{caseItem.ipcmName}</td>
                    <td>
                      <span className="case-status">{caseItem.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={4}>
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