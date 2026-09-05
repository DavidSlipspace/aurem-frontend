import type {
  IpcmDirectoryItem
} from "../../types/ipcm";

import {
  InvitationStatus
} from "./InvitationStatus";

import {
  PaymentSetupStatus
} from "./PaymentSetupStatus";

type IpcmTableProps = {
  ipcms:
    IpcmDirectoryItem[];

  canManageInvitations: boolean;

  resendingInvitationId:
    | string
    | null;

  removingIpcmId:
    | string
    | null;

  onResend:
    (
      item:
        IpcmDirectoryItem
    ) => void;

  onRemove:
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
        "numeric"
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

  const name =
    `${item.firstName ?? ""} ${item.lastName ?? ""}`
      .trim();

  return (
    name ||
    "IPCM"
  );
}

export function IpcmTable({
  ipcms,
  canManageInvitations,
  resendingInvitationId,
  removingIpcmId,
  onResend,
  onRemove
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
              Profile
            </th>

            <th>
              Payment Setup
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

                const isRemoving =
                  removingIpcmId ===
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
                      <PaymentSetupStatus
                        status={
                          item.paymentStatus
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
                        <div className="ipcm-table-actions">
                          {item.type ===
                            "invitation" && (
                            <button
                              type="button"
                              className="ipcm-table-action"
                              onClick={() =>
                                onResend(
                                  item
                                )
                              }
                              disabled={
                                isResending ||
                                isRemoving
                              }
                            >
                              {isResending
                                ? "Sending..."
                                : item.status ===
                                    "expired"
                                  ? "Send New Invite"
                                  : "Resend"}
                            </button>
                          )}

                          <button
                            type="button"
                            className="ipcm-table-action ipcm-table-action-danger"
                            onClick={() =>
                              onRemove(
                                item
                              )
                            }
                            disabled={
                              isRemoving ||
                              isResending
                            }
                          >
                            {isRemoving
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
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
                    ? 7
                    : 6
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