import type {
  IpcmDirectoryItem
} from "../../types/ipcm";

type RemoveIpcmDialogProps = {
  item:
    IpcmDirectoryItem |
    null;

  isRemoving: boolean;

  onConfirm:
    () => void;

  onCancel:
    () => void;
};

function getDisplayName(
  item:
    IpcmDirectoryItem
): string {
  if (
    item.type ===
    "invitation"
  ) {
    return item.email;
  }

  const name =
    `${item.firstName ?? ""} ${item.lastName ?? ""}`
      .trim();

  return (
    name ||
    item.email
  );
}

export function RemoveIpcmDialog({
  item,
  isRemoving,
  onConfirm,
  onCancel
}: RemoveIpcmDialogProps) {
  if (!item) {
    return null;
  }

  const isInvitation =
    item.type ===
    "invitation";

  return (
    <div
      className="ipcm-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget &&
          !isRemoving
        ) {
          onCancel();
        }
      }}
    >
      <section
        className="ipcm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-ipcm-title"
      >
        <h2
          id="remove-ipcm-title"
        >
          {isInvitation
            ? "Remove invitation?"
            : "Remove IPCM?"}
        </h2>

        <p>
          {isInvitation
            ? `This will revoke the invitation for ${getDisplayName(
                item
              )}. The invitation link will no longer work.`
            : `This will deactivate ${getDisplayName(
                item
              )}'s Aurem account and disable sign-in access.`}
        </p>

        {!isInvitation && (
          <p className="ipcm-dialog-note">
            IPCMs assigned to an
            active case or trip
            must be reassigned
            before they can be
            removed.
          </p>
        )}

        <div className="ipcm-dialog-actions">
          <button
            type="button"
            className="ipcm-secondary-button"
            onClick={
              onCancel
            }
            disabled={
              isRemoving
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="ipcm-danger-button"
            onClick={
              onConfirm
            }
            disabled={
              isRemoving
            }
          >
            {isRemoving
              ? "Removing..."
              : "Remove"}
          </button>
        </div>
      </section>
    </div>
  );
}