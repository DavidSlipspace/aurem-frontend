import {
  type FormEvent,
  useState
} from "react";

import {
  authenticateUser,
  requestPasswordReset
} from "../api/authApi";

import {
  getUser
} from "../api/userApi";

import {
  getCases
} from "../api/caseApi";

import type {
  UserResponse
} from "../types/user";

import type {
  CaseResponse
} from "../types/case";

import "./login.css";

type LoginPageProps = {
  onLoginSuccess: (
    idToken: string,
    user: UserResponse,
    cases: CaseResponse[]
  ) => void;
};

export function LoginPage({
  onLoginSuccess
}: LoginPageProps) {
  const [
    email,
    setEmail
  ] =
    useState("");

  const [
    password,
    setPassword
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);

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
    isLoading,
    setIsLoading
  ] =
    useState(false);

  const [
    isForgotPassword,
    setIsForgotPassword
  ] =
    useState(false);

  async function handleLogin(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    setIsLoading(
      true
    );

    try {
      const idToken =
        await authenticateUser(
          email,
          password
        );

      const user =
        await getUser(
          idToken
        );

      const casesResponse =
        await getCases(
          idToken
        );

      onLoginSuccess(
        idToken,
        user,
        casesResponse.cases
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed."
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  async function handleForgotPassword(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    setIsLoading(
      true
    );

    try {
      await requestPasswordReset(
        email
      );

      setSuccessMessage(
        "If an Aurem account exists for that email address, a password reset link has been sent."
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email."
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          Aurem
        </div>

        <div className="login-heading">
          <h1>
            {isForgotPassword
              ? "Reset your password"
              : "Sign in"}
          </h1>

          <p>
            {isForgotPassword
              ? "Enter your account email and we'll send you a secure password reset link."
              : "Sign in to continue to the Aurem portal."}
          </p>
        </div>

        <form
          onSubmit={
            isForgotPassword
              ? handleForgotPassword
              : handleLogin
          }
        >
          <label
            htmlFor="email"
          >
            Email
          </label>

          <input
            id="email"
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
            placeholder="you@example.com"
            required
          />

          {!isForgotPassword && (
            <>
              <label
                htmlFor="password"
              >
                Password
              </label>

              <div className="password-field">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setIsForgotPassword(
                    true
                  );

                  setErrorMessage(
                    ""
                  );

                  setSuccessMessage(
                    ""
                  );
                }}
              >
                Forgot password?
              </button>
            </>
          )}

          {errorMessage && (
            <div
              className="login-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="login-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="login-primary-button"
            disabled={
              isLoading
            }
          >
            {isLoading
              ? isForgotPassword
                ? "Sending..."
                : "Signing in..."
              : isForgotPassword
                ? "Send Reset Link"
                : "Sign In"}
          </button>

          {isForgotPassword && (
            <button
              type="button"
              className="login-back-button"
              onClick={() => {
                setIsForgotPassword(
                  false
                );

                setErrorMessage(
                  ""
                );

                setSuccessMessage(
                  ""
                );
              }}
              disabled={
                isLoading
              }
            >
              Back to sign in
            </button>
          )}
        </form>
      </section>
    </main>
  );
}