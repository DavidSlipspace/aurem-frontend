import {
  FormEvent,
  useState
} from "react";

type InviteIpcmFormProps = {
  isSubmitting: boolean;

  onSubmit:
    (
      email: string
    ) => Promise<void>;

  onCancel:
    () => void;
};

export function InviteIpcmForm({
  isSubmitting,
  onSubmit,
  onCancel
}: InviteIpcmFormProps) {
  const [
    email,
    setEmail
  ] =
    useState("");

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail
    ) {
      return;
    }

    await onSubmit(
      normalizedEmail
    );
  }

  return (
    <section className="invite-ipcm-card">
      <div className="invite-ipcm-card-header">
        <div>
          <h2>
            Invite IPCM
          </h2>

          <p>
            A secure account
            creation link will be
            sent to the IPCM's
            email address.
          </p>
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <label
          htmlFor="ipcm-email"
        >
          Email address

          <input
            id="ipcm-email"
            type="email"
            value={
              email
            }
            onChange={
              (event) =>
                setEmail(
                  event.target
                    .value
                )
            }
            placeholder="ipcm@example.com"
            autoComplete="email"
            disabled={
              isSubmitting
            }
            required
          />
        </label>

        <p className="invite-ipcm-help">
          The invitation expires
          after 7 days. Sending a
          new invitation to the
          same email invalidates
          the previous one.
        </p>

        <div className="invite-ipcm-actions">
          <button
            type="button"
            className="ipcm-secondary-button"
            onClick={
              onCancel
            }
            disabled={
              isSubmitting
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="ipcm-primary-button"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Sending..."
              : "Send Invitation"}
          </button>
        </div>
      </form>
    </section>
  );
}