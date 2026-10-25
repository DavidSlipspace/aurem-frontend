import type { IpcmPaymentProfile, PaymentMethodType } from "../../types/payment";
import { PaymentMethodCard } from "./PaymentMethodCard";
import "./paymentMethods.css";

type IpcmPaymentMethodsPanelProps = {
  profile: IpcmPaymentProfile;
  canManage: boolean;
  showIdentity?: boolean;
  onConfigure: (profile: IpcmPaymentProfile, type: PaymentMethodType) => void;
};

export function IpcmPaymentMethodsPanel({
  profile,
  canManage,
  showIdentity = true,
  onConfigure
}: IpcmPaymentMethodsPanelProps) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return (
    <section className="orvo-pm-panel" aria-label={showIdentity ? `Payment methods for ${fullName}` : "Payment methods"}>
      {showIdentity && (
        <header className="orvo-pm-panel__header">
          <div className="orvo-pm-panel__identity">
            <div className="orvo-pm-panel__avatar" aria-hidden="true">{`${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() || "CM"}</div>
            <div className="orvo-pm-panel__person">
              <h2>{fullName || "Case Manager"}</h2>
              <p>{profile.email}</p>
            </div>
          </div>
          <span className="orvo-pm-panel__role">Case Manager</span>
        </header>
      )}
      <div className="orvo-pm-panel__heading">
        <div>
          <h3>Payment methods</h3>
          <p>Manage the payment options available for authorized travel transactions.</p>
        </div>
        <span className="orvo-pm-panel__secure"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>Secure setup</span>
      </div>
      <div className="orvo-pm-panel__grid">
        <PaymentMethodCard type="card" method={profile.card} canManage={canManage} onConfigure={type => onConfigure(profile, type)} />
        <PaymentMethodCard type="bank_account" method={profile.bankAccount} canManage={canManage} onConfigure={type => onConfigure(profile, type)} />
      </div>
    </section>
  );
}
