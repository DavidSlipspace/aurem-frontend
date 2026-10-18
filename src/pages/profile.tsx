import {
  type FormEvent,
  useState
} from "react";

import {
  updateMyProfile
} from "../api/profileApi";

import type {
  UserResponse
} from "../types/user";

import "./profile.css";

type ProfilePageProps = {
  idToken: string;

  user:
    UserResponse;

  onUserUpdated:
    (
      user:
        UserResponse
    ) => void;
};

export function ProfilePage({
  idToken,
  user,
  onUserUpdated
}: ProfilePageProps) {
  const [
    firstName,
    setFirstName
  ] =
    useState(
      user.firstName
    );

  const [
    lastName,
    setLastName
  ] =
    useState(
      user.lastName
    );

  const [
    isSaving,
    setIsSaving
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

  async function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >
  ) {
    event.preventDefault();

    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    setSuccessMessage(
      ""
    );

    try {
      const updatedUser =
        await updateMyProfile(
          idToken,
          {
            firstName:
              firstName.trim(),

            lastName:
              lastName.trim()
          }
        );

      onUserUpdated(
        updatedUser
      );

      setSuccessMessage(
        "Profile updated."
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-content">
        <header className="profile-header">
          <h1>
            My Profile
          </h1>

          <p>
            Maintain the account
            information used in
            your IPCM portal.
          </p>
        </header>

        {successMessage && (
          <div className="profile-success">
            {
              successMessage
            }
          </div>
        )}

        {errorMessage && (
          <div className="profile-error">
            {
              errorMessage
            }
          </div>
        )}

        <form
          className="profile-card"
          onSubmit={
            handleSubmit
          }
        >
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
            Email

            <input
              type="email"
              value={
                user.email
              }
              readOnly
            />
          </label>

          <div className="profile-actions">
            <button
              type="submit"
              disabled={
                isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}