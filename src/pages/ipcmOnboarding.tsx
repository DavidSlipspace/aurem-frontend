import {
  type FormEvent,
  useEffect,
  useState
} from "react";

import {
  acceptIpcmInvitation,
  getIpcmInvitation
} from "../api/ipcmOnboardingApi";

import type {
  IpcmInvitationDetails
} from "../types/ipcmOnboarding";

import "./ipcmOnboarding.css";

type IpcmOnboardingPageProps = {
  token: string;
};

export function IpcmOnboardingPage({
  token
}: IpcmOnboardingPageProps) {
  const [
    invitation,
    setInvitation
  ] =
    useState<
      IpcmInvitationDetails |
      null
    >(null);

  const [
    firstName,
    setFirstName
  ] =
    useState("");

  const [
    lastName,
    setLastName
  ] =
    useState("");

  const [
    password,
    setPassword
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");

  const [
    isLoading,
    setIsLoading
  ] =
    useState(true);

  const [
    isSubmitting,
    setIsSubmitting
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  const [
    isComplete,
    setIsComplete
  ] =
    useState(false);

  useEffect(
    () => {
      async function loadInvitation() {
        try {
          const response =
            await getIpcmInvitation(
              token
            );

          setInvitation(
            response
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this invitation."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      }

      void loadInvitation();
    },
    [
      token
    ]
  );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(
      ""
    );

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "Passwords do not match."
      );

      return;
    }

    if (
      password.length <
      8
    ) {
      setErrorMessage(
        "Password must contain at least 8 characters."
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      await acceptIpcmInvitation(
        token,
        {
          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          password
        }
      );

      setIsComplete(
        true
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your Aurem account."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  if (
    isLoading
  ) {
    return (
      <main className="ipcm-onboarding-page">
        <section className="ipcm-onboarding-card">
          <div className="ipcm-onboarding-brand">
            Aurem
          </div>

          <div className="ipcm-onboarding-state">
            Loading your
            invitation...
          </div>
        </section>
      </main>
    );
  }

  if (
    isComplete
  ) {
    return (
      <main className="ipcm-onboarding-page">
        <section className="ipcm-onboarding-card">
          <div className="ipcm-onboarding-brand">
            Aurem
          </div>

          <div className="ipcm-onboarding-intro">
            <p className="ipcm-onboarding-eyebrow">
              Account ready
            </p>

            <h1>
              Welcome to Aurem
            </h1>

            <p>
              Your IPCM account
              has been created.
              You can now sign in
              to view assigned
              cases and trips,
              maintain your
              profile, and
              configure payment
              information.
            </p>
          </div>

          <button
            type="button"
            className="ipcm-onboarding-primary"
            onClick={() => {
              window.location.href =
                "/";
            }}
          >
            Continue to Sign In
          </button>
        </section>
      </main>
    );
  }

  if (
    !invitation
  ) {
    return (
      <main className="ipcm-onboarding-page">
        <section className="ipcm-onboarding-card">
          <div className="ipcm-onboarding-brand">
            Aurem
          </div>

          <div className="ipcm-onboarding-intro">
            <p className="ipcm-onboarding-eyebrow">
              IPCM invitation
            </p>

            <h1>
              Invitation unavailable
            </h1>

            <p>
              We could not verify
              this account
              invitation.
            </p>
          </div>

          <div
            className="ipcm-onboarding-error"
            role="alert"
          >
            {errorMessage ||
              "This invitation is invalid, expired, or has already been used."}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ipcm-onboarding-page">
      <section className="ipcm-onboarding-card">
        <div className="ipcm-onboarding-brand">
          Aurem
        </div>

        <div className="ipcm-onboarding-intro">
          <p className="ipcm-onboarding-eyebrow">
            IPCM invitation
          </p>

          <h1>
            Create your Aurem account
          </h1>

          <p>
            Set up your secure
            IPCM portal account.
            Once signed in, you
            will be able to view
            assigned cases and
            trips, maintain your
            profile, and manage
            your payment setup.
          </p>
        </div>

        <div className="ipcm-onboarding-email">
          <span>
            Invitation sent to
          </span>

          <strong>
            {
              invitation.email
            }
          </strong>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div className="ipcm-onboarding-name-grid">
            <label>
              First name

              <input
                value={
                  firstName
                }
                onChange={(
                  event
                ) =>
                  setFirstName(
                    event.target.value
                  )
                }
                maxLength={
                  100
                }
                autoComplete="given-name"
                required
              />
            </label>

            <label>
              Last name

              <input
                value={
                  lastName
                }
                onChange={(
                  event
                ) =>
                  setLastName(
                    event.target.value
                  )
                }
                maxLength={
                  100
                }
                autoComplete="family-name"
                required
              />
            </label>
          </div>

          <label>
            Password

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              minLength={
                8
              }
              required
            />
          </label>

          <label>
            Confirm password

            <input
              type="password"
              value={
                confirmPassword
              }
              onChange={(
                event
              ) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              minLength={
                8
              }
              required
            />
          </label>

          <p className="ipcm-password-help">
            Use at least 8
            characters. Your
            password is managed
            securely through
            Amazon Cognito.
          </p>

          {errorMessage && (
            <div
              className="ipcm-onboarding-error"
              role="alert"
            >
              {
                errorMessage
              }
            </div>
          )}

          <button
            type="submit"
            className="ipcm-onboarding-primary"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Creating account..."
              : "Create Aurem Account"}
          </button>
        </form>
      </section>
    </main>
  );
}