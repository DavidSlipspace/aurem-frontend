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
      FormEvent<
        HTMLFormElement
      >
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
          Loading invitation...
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
          <h1>
            Account created
          </h1>

          <p>
            Your IPCM account is
            ready. Sign in to
            access your cases,
            trips, profile, and
            payment setup.
          </p>

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
          <h1>
            Invitation unavailable
          </h1>

          <p className="ipcm-onboarding-error">
            {errorMessage ||
              "This invitation is invalid, expired, or has already been used."}
          </p>
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

        <h1>
          Create your IPCM account
        </h1>

        <p className="ipcm-onboarding-copy">
          This invitation creates
          your secure Aurem portal
          account. After signing
          in, you can manage your
          profile and payment
          setup and view the cases
          and trips assigned to
          you.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Email

            <input
              type="email"
              value={
                invitation.email
              }
              readOnly
            />
          </label>

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
              required
            />
          </label>

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

          {errorMessage && (
            <p
              className="ipcm-onboarding-error"
              role="alert"
            >
              {
                errorMessage
              }
            </p>
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