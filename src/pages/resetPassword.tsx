import {
  type FormEvent,
  useState
} from "react";

import {
  confirmPasswordReset
} from "../api/authApi";

import "./resetPassword.css";

type ResetPasswordPageProps = {
  initialEmail: string;
  initialCode: string;
};

export function ResetPasswordPage({
  initialEmail,
  initialCode
}: ResetPasswordPageProps) {
  const [
    email,
    setEmail
  ] =
    useState(
      initialEmail
    );

  const [
    code,
    setCode
  ] =
    useState(
      initialCode
    );

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
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting
  ] =
    useState(false);

  const [
    isComplete,
    setIsComplete
  ] =
    useState(false);

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
      await confirmPasswordReset(
        email,
        code,
        password
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
          : "Unable to reset your password."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        <div className="reset-password-brand">
          Aurem
        </div>

        {isComplete ? (
          <>
            <div className="reset-password-heading">
              <p className="reset-password-eyebrow">
                Password updated
              </p>

              <h1>
                Your password has been reset
              </h1>

              <p>
                You can now sign in
                using your new
                password.
              </p>
            </div>

            <button
              type="button"
              className="reset-password-primary"
              onClick={() => {
                window.location.href =
                  "/";
              }}
            >
              Continue to Sign In
            </button>
          </>
        ) : (
          <>
            <div className="reset-password-heading">
              <p className="reset-password-eyebrow">
                Account recovery
              </p>

              <h1>
                Choose a new password
              </h1>

              <p>
                Enter a new password
                for your Aurem
                account.
              </p>
            </div>

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
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  required
                />
              </label>

              {!initialCode && (
                <label>
                  Reset code

                  <input
                    value={
                      code
                    }
                    onChange={(
                      event
                    ) =>
                      setCode(
                        event.target.value
                      )
                    }
                    inputMode="numeric"
                    required
                  />
                </label>
              )}

              <label>
                New password

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
                Confirm new password

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
                <div
                  className="reset-password-error"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="reset-password-primary"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Updating password..."
                  : "Update Password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}