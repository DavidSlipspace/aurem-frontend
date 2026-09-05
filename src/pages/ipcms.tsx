import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  getIpcms,
  inviteIpcm,
  removeIpcm
} from "../api/ipcmApi";

import {
  InviteIpcmForm
} from "../components/ipcms/InviteIpcmForm";

import {
  IpcmTable
} from "../components/ipcms/IpcmTable";

import {
  RemoveIpcmDialog
} from "../components/ipcms/RemoveIpcmDialog";

import type {
  IpcmDirectoryItem
} from "../types/ipcm";

import type {
  UserResponse
} from "../types/user";

import "./ipcms.css";

type IpcmsPageProps = {
  idToken: string;
  user: UserResponse;
};

export function IpcmsPage({
  idToken,
  user
}: IpcmsPageProps) {
  const canManageInvitations =
    user.role ===
    "Admin";

  const [
    ipcms,
    setIpcms
  ] =
    useState<
      IpcmDirectoryItem[]
    >([]);

  const [
    isLoading,
    setIsLoading
  ] =
    useState(
      true
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage
  ] =
    useState("");

  const [
    showInviteForm,
    setShowInviteForm
  ] =
    useState(
      false
    );

  const [
    isSendingInvite,
    setIsSendingInvite
  ] =
    useState(
      false
    );

  const [
    resendingInvitationId,
    setResendingInvitationId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    itemPendingRemoval,
    setItemPendingRemoval
  ] =
    useState<
      IpcmDirectoryItem |
      null
    >(null);

  const [
    removingIpcmId,
    setRemovingIpcmId
  ] =
    useState<
      string |
      null
    >(null);

  const loadIpcms =
    useCallback(
      async () => {
        setIsLoading(
          true
        );

        setErrorMessage(
          ""
        );

        try {
          const response =
            await getIpcms(
              idToken
            );

          setIpcms(
            response.ipcms
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load IPCM profiles."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      },
      [
        idToken
      ]
    );

  useEffect(
    () => {
      void loadIpcms();
    },
    [
      loadIpcms
    ]
  );

  async function handleInvite(
    email: string
  ) {
    if (
      !canManageInvitations
    ) {
      return;
    }

    setIsSendingInvite(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await inviteIpcm(
          idToken,
          email
        );

      setSuccessMessage(
        `Invitation sent to ${response.sentTo}.`
      );

      setShowInviteForm(
        false
      );

      await loadIpcms();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the IPCM invitation."
      );
    } finally {
      setIsSendingInvite(
        false
      );
    }
  }

  async function handleResend(
    item:
      IpcmDirectoryItem
  ) {
    if (
      !canManageInvitations
    ) {
      return;
    }

    setResendingInvitationId(
      item.id
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await inviteIpcm(
          idToken,
          item.email
        );

      setSuccessMessage(
        `A new invitation was sent to ${response.sentTo}.`
      );

      await loadIpcms();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend the IPCM invitation."
      );
    } finally {
      setResendingInvitationId(
        null
      );
    }
  }

  function handleRequestRemove(
    item:
      IpcmDirectoryItem
  ) {
    if (
      !canManageInvitations
    ) {
      return;
    }

    setSuccessMessage(
      ""
    );

    setErrorMessage(
      ""
    );

    setItemPendingRemoval(
      item
    );
  }

  async function handleConfirmRemove() {
    if (
      !canManageInvitations ||
      !itemPendingRemoval
    ) {
      return;
    }

    const item =
      itemPendingRemoval;

    setRemovingIpcmId(
      item.id
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const response =
        await removeIpcm(
          idToken,
          item
        );

      setSuccessMessage(
        response.message
      );

      setItemPendingRemoval(
        null
      );

      await loadIpcms();
    } catch (
      error
    ) {
      setItemPendingRemoval(
        null
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove the IPCM."
      );

      window.scrollTo({
        top:
          0,

        behavior:
          "smooth"
      });
    } finally {
      setRemovingIpcmId(
        null
      );
    }
  }

  return (
    <main className="ipcms-page">
      <section className="ipcms-content">
        <header className="ipcms-header">
          <div>
            <h1>
              IPCM Profiles
            </h1>

            <p>
              Manage IPCM access,
              onboarding, and
              payment readiness
              for your agency.
            </p>
          </div>

          {canManageInvitations && (
            <button
              type="button"
              className="ipcm-primary-button"
              onClick={() => {
                setShowInviteForm(
                  true
                );

                setSuccessMessage(
                  ""
                );
              }}
            >
              + Invite IPCM
            </button>
          )}
        </header>

        {errorMessage && (
          <div
            className="ipcms-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="ipcms-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {canManageInvitations &&
          showInviteForm && (
            <InviteIpcmForm
              isSubmitting={
                isSendingInvite
              }
              onSubmit={
                handleInvite
              }
              onCancel={() =>
                setShowInviteForm(
                  false
                )
              }
            />
          )}

        <div className="ipcms-table-toolbar">
          <button
            type="button"
            className="ipcm-secondary-button"
            onClick={() => {
              void loadIpcms();
            }}
            disabled={
              isLoading
            }
          >
            {isLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="ipcms-loading">
            Loading IPCM
            profiles...
          </div>
        ) : (
          <IpcmTable
            ipcms={
              ipcms
            }
            canManageInvitations={
              canManageInvitations
            }
            resendingInvitationId={
              resendingInvitationId
            }
            removingIpcmId={
              removingIpcmId
            }
            onResend={
              handleResend
            }
            onRemove={
              handleRequestRemove
            }
          />
        )}
      </section>

      <RemoveIpcmDialog
        item={
          itemPendingRemoval
        }
        isRemoving={
          removingIpcmId !==
          null
        }
        onConfirm={() => {
          void handleConfirmRemove();
        }}
        onCancel={() => {
          if (
            removingIpcmId ===
            null
          ) {
            setItemPendingRemoval(
              null
            );
          }
        }}
      />
    </main>
  );
}