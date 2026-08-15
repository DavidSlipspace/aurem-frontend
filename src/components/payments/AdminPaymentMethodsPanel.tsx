import type {
  IpcmPaymentProfile,
  PaymentMethodType
} from "../../types/payment";

import {
  IpcmPaymentMethodsPanel
} from "./IpcmPaymentMethodsPanel";

type AdminPaymentMethodsPanelProps = {
  profiles:
    IpcmPaymentProfile[];

  onConfigure:
    (
      profile:
        IpcmPaymentProfile,

      type:
        PaymentMethodType
    ) => void;
};

export function AdminPaymentMethodsPanel({
  profiles,
  onConfigure
}: AdminPaymentMethodsPanelProps) {
  if (
    profiles.length ===
    0
  ) {
    return (
      <div className="payments-empty-state">
        <h2>
          No IPCMs found
        </h2>

        <p>
          There are no active
          IPCM users in your
          company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-payment-method-list">
      {profiles.map(
        (profile) => (
          <IpcmPaymentMethodsPanel
            key={
              profile.userId
            }
            profile={
              profile
            }
            canManage
            onConfigure={
              onConfigure
            }
          />
        )
      )}
    </div>
  );
}