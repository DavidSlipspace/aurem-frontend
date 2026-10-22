
import {
  type FormEvent,
  useState
} from "react";

import {
  authenticateUser,
  completeNewPasswordChallenge,
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

type PasswordChallenge = {
  username: string;
  session: string;
};

export function LoginPage({
  onLoginSuccess
}: LoginPageProps) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmNewPassword, setConfirmNewPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordChallenge, setPasswordChallenge] =
    useState<PasswordChallenge | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [isForgotPassword, setIsForgotPassword] =
    useState(false);

  async function finishLogin(
    idToken: string
  ) {
    const user =
      await getUser(idToken);

    const casesResponse =
      await getCases(idToken);

    onLoginSuccess(
      idToken,
      user,
      casesResponse.cases
    );
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result =
        await authenticateUser(
          email,
          password
        );

      if (result.status === "new_password_required") {
        setPasswordChallenge({
          username: result.username,
          session: result.session
        });

        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");

        return;
      }

      await finishLogin(result.idToken);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNewPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!passwordChallenge) {
      setErrorMessage(
        "Your password setup session is unavailable. Please sign in again."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    if (!newPassword) {
      setErrorMessage(
        "Please enter a new password."
      );
      return;
    }

    setIsLoading(true);

    try {
      const idToken =
        await completeNewPasswordChallenge(
          passwordChallenge.username,
          passwordChallenge.session,
          newPassword
        );

      setPasswordChallenge(null);
      setNewPassword("");
      setConfirmNewPassword("");

      await finishLogin(idToken);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to set your password."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await requestPasswordReset(email);

      setSuccessMessage(
        "If an Orvo account exists for that email address, a password reset link has been sent."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function returnToSignIn() {
    setPasswordChallenge(null);
    setIsForgotPassword(false);
    setPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage("");
    setSuccessMessage("");
  }

  const isSettingNewPassword =
    passwordChallenge !== null;

  const heading = isSettingNewPassword
    ? "Create your password"
    : isForgotPassword
      ? "Reset your password"
      : "Sign in";

  const description = isSettingNewPassword
    ? "This is your first time signing in. Create a permanent password to secure your Orvo account."
    : isForgotPassword
      ? "Enter your account email and we'll send you a secure password reset link."
      : "Sign in to continue to the Orvo portal.";

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          Orvo
        </div>

        <div className="login-heading">
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>

        {isSettingNewPassword ? (
          <form onSubmit={handleNewPassword}>
            <label htmlFor="new-password">
              New password
            </label>

            <div className="password-field">
              <input
                id="new-password"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowNewPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="confirm-new-password">
              Confirm new password
            </label>

            <div className="password-field">
              <input
                id="confirm-new-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmNewPassword}
                onChange={(event) =>
                  setConfirmNewPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="login-password-hint">
              Choose a strong, unique password that
              meets your organization's password
              requirements.
            </p>

            {errorMessage && (
              <div
                className="login-error"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="login-primary-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Setting password..."
                : "Set Password & Continue"}
            </button>

            <button
              type="button"
              className="login-back-button"
              onClick={returnToSignIn}
              disabled={isLoading}
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form
            onSubmit={
              isForgotPassword
                ? handleForgotPassword
                : handleLogin
            }
          >
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="you@example.com"
              required
            />

            {!isForgotPassword && (
              <>
                <label htmlFor="password">
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
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
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
                    setIsForgotPassword(true);
                    setErrorMessage("");
                    setSuccessMessage("");
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
              disabled={isLoading}
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
                onClick={returnToSignIn}
                disabled={isLoading}
              >
                Back to sign in
              </button>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
