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
  switch (
    status
  ) {
    case "active":
      return "Active";

    case "invited":
      return "Invited";

    case "expired":
      return "Expired";
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