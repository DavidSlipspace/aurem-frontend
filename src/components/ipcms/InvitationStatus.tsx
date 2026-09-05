import type {
  IpcmDirectoryStatus
} from "../../types/ipcm";

type InvitationStatusProps = {
  status:
    IpcmDirectoryStatus;
};

function getLabel(
  status:
    IpcmDirectoryStatus
): string {
  switch (status) {
    case "active":
      return "Profile Created";

    case "invited":
      return "Invitation Sent";

    case "expired":
      return "Invitation Expired";
  }
}

export function InvitationStatus({
  status
}: InvitationStatusProps) {
  return (
    <span
      className={
        `ipcm-status ` +
        `ipcm-status-${status}`
      }
    >
      {getLabel(
        status
      )}
    </span>
  );
}