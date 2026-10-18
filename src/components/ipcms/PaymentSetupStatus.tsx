import type {
  IpcmPaymentSetupStatus
} from "../../types/ipcm";

type PaymentSetupStatusProps = {
  status:
    IpcmPaymentSetupStatus;
};

function getLabel(
  status:
    IpcmPaymentSetupStatus
): string {
  switch (status) {
    case "configured":
      return "Configured";

    case "in_progress":
      return "In Progress";

    case "not_started":
      return "Not Started";
  }
}

export function PaymentSetupStatus({
  status
}: PaymentSetupStatusProps) {
  return (
    <span
      className={
        `ipcm-payment-status ` +
        `ipcm-payment-status-${status}`
      }
    >
      {getLabel(
        status
      )}
    </span>
  );
}