import type {
  IpcmPaymentProfile,
  PaymentMethodType
} from "../../types/payment";

import {
  PaymentMethodCard
} from "./PaymentMethodCard";

type IpcmPaymentMethodsPanelProps = {
  profile:
    IpcmPaymentProfile;

  canManage: boolean;

  showIdentity?: boolean;

  onConfigure:
    (
      profile:
        IpcmPaymentProfile,

      type:
        PaymentMethodType
    ) => void;
};

export function IpcmPaymentMethodsPanel({
  profile,
  canManage,
  showIdentity = true,
  onConfigure
}: IpcmPaymentMethodsPanelProps) {
  return (
    <section className="ipcm-payment-panel">
      {showIdentity && (
        <header className="ipcm-payment-panel-header">
          <div>
            <h2>
              {profile.firstName}{" "}
              {profile.lastName}
            </h2>

            <p>
              {profile.email}
            </p>
          </div>

          <span className="ipcm-payment-role">
            IPCM
          </span>
        </header>
      )}

      <div className="payment-method-grid">
        <PaymentMethodCard
          type="card"
          method={
            profile.card
          }
          canManage={
            canManage
          }
          onConfigure={
            (type) =>
              onConfigure(
                profile,
                type
              )
          }
        />

        <PaymentMethodCard
          type="bank_account"
          method={
            profile.bankAccount
          }
          canManage={
            canManage
          }
          onConfigure={
            (type) =>
              onConfigure(
                profile,
                type
              )
          }
        />
      </div>
    </section>
  );
}