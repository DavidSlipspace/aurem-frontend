import {
  useEffect,
  useState
} from "react";

import {
  getIpcms,
  inviteIpcm
} from "../api/ipcmApi";

import {
  InviteIpcmForm
} from "../components/ipcms/InviteIpcmForm";

import {
  IpcmTable
} from "../components/ipcms/IpcmTable";

import type {
  IpcmDirectoryItem
} from "../types/ipcm";

import "./ipcms.css";

type IpcmsPageProps = {
  idToken: string;
};

export function IpcmsPage({
  idToken
}: IpcmsPageProps) {
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

  useEffect(
    () => {
      loadIpcms();
    },
    [
      idToken
    ]
  );

  async function loadIpcms() {
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
          : "Unable to load IPCMs."
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  async function handleInvite(
    email: string
  ) {
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

  return (
    <main className="ipcms-page">
      <section className="ipcms-content">
        <header className="ipcms-header">
          <div>
            <p className="ipcms-eyebrow">
              User administration
            </p>

            <h1>
              IPCMs
            </h1>

            <p>
              Invite IPCMs to
              create Aurem
              accounts and manage
              outstanding
              invitations.
            </p>
          </div>

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
            Invite IPCM
          </button>
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

        {showInviteForm && (
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

        <div className="ipcms-section-header">
          <div>
            <h2>
              IPCM Directory
            </h2>

            <p>
              Active accounts and
              outstanding account
              invitations for your
              agency.
            </p>
          </div>

          <button
            type="button"
            className="ipcm-secondary-button"
            onClick={
              loadIpcms
            }
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
            Loading IPCMs...
          </div>
        ) : (
          <IpcmTable
            ipcms={
              ipcms
            }
            resendingInvitationId={
              resendingInvitationId
            }
            onResend={
              handleResend
            }
          />
        )}
      </section>
    </main>
  );
}