import type {
  IpcmDirectoryItem
} from "../../types/ipcm";

import {
  InvitationStatus
} from "./InvitationStatus";

type IpcmTableProps = {
  ipcms:
    IpcmDirectoryItem[];

  canManageInvitations: boolean;

  resendingInvitationId:
    | string
    | null;

  onResend:
    (
      item:
        IpcmDirectoryItem
    ) => void;
};

function formatDateTime(
  value:
    | string
    | null
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit"
    }
  ).format(
    date
  );
}

function getName(
  item:
    IpcmDirectoryItem
): string {
  if (
    item.type ===
    "invitation"
  ) {
    return "Pending profile";
  }

  return (
    `${item.firstName ?? ""} ` +
    `${item.lastName ?? ""}`
  ).trim();
}

export function IpcmTable({
  ipcms,
  canManageInvitations,
  resendingInvitationId,
  onResend
}: IpcmTableProps) {
  return (
    <div className="ipcm-table-card">
      <table>
        <thead>
          <tr>
            <th>
              Name
            </th>

            <th>
              Email
            </th>

            <th>
              Status
            </th>

            <th>
              Invitation Sent
            </th>

            <th>
              Expires
            </th>

            {canManageInvitations && (
              <th>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {ipcms.length >
          0 ? (
            ipcms.map(
              (
                item
              ) => {
                const isResending =
                  resendingInvitationId ===
                  item.id;

                return (
                  <tr
                    key={
                      `${item.type}-${item.id}`
                    }
                  >
                    <td>
                      <strong>
                        {getName(
                          item
                        )}
                      </strong>
                    </td>

                    <td>
                      {
                        item.email
                      }
                    </td>

                    <td>
                      <InvitationStatus
                        status={
                          item.status
                        }
                      />
                    </td>

                    <td>
                      {item.type ===
                      "invitation"
                        ? formatDateTime(
                            item.invitationSentAt
                          )
                        : "—"}
                    </td>

                    <td>
                      {item.type ===
                      "invitation"
                        ? formatDateTime(
                            item.invitationExpiresAt
                          )
                        : "—"}
                    </td>

                    {canManageInvitations && (
                      <td>
                        {item.type ===
                        "invitation" ? (
                          <button
                            type="button"
                            className="ipcm-table-action"
                            onClick={() =>
                              onResend(
                                item
                              )
                            }
                            disabled={
                              isResending
                            }
                          >
                            {isResending
                              ? "Sending..."
                              : item.status ===
                                  "expired"
                                ? "Send New Invite"
                                : "Resend"}
                          </button>
                        ) : (
                          <span className="ipcm-no-action">
                            Account created
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              }
            )
          ) : (
            <tr>
              <td
                className="ipcm-empty-state"
                colSpan={
                  canManageInvitations
                    ? 6
                    : 5
                }
              >
                No IPCM profiles
                found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}