import type {
  CaseResponse
} from "../types/case";

import type {
  UserResponse
} from "../types/user";

import "./home.css";

type HomePageProps = {
  cases:
    CaseResponse[];

  user:
    UserResponse;
};

export function HomePage({
  cases,
  user
}: HomePageProps) {
  const isIpcm =
    user.role ===
    "IPCM";

  return (
    <main className="home-page">
      <section className="home-content">
        <div className="home-header">
          <h1>
            {isIpcm
              ? "My Cases"
              : "Active Cases"}
          </h1>

          <p>
            {isIpcm
              ? "Cases currently assigned to you."
              : "Cases currently available based on your role and assignments."}
          </p>
        </div>

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
                  Status
                </th>
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
                        {
                          caseItem.caseReferenceId
                        }
                      </td>

                      <td>
                        {
                          caseItem.caseManagerName
                        }
                      </td>

                      <td>
                        {
                          caseItem.ipcmName
                        }
                      </td>

                      <td>
                        <span className="case-status">
                          {
                            caseItem.status
                          }
                        </span>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    className="empty-state"
                    colSpan={
                      4
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
      </section>
    </main>
  );
}