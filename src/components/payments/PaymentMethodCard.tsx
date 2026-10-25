import type { IpcmPaymentMethod, PaymentMethodType } from "../../types/payment";

type PaymentMethodCardProps = {
  type: PaymentMethodType;
  method: IpcmPaymentMethod | null;
  canManage: boolean;
  onConfigure: (type: PaymentMethodType) => void;
};

function CardIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/></svg>;
}
function BankIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-5 9 5M4 10h16M6 10v8m4-8v8m4-8v8m4-8v8M3 20h18M2 22h20"/></svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}
function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;
}

function titleFor(type: PaymentMethodType) {
  return type === "card" ? "Travel card" : "Bank account";
}
function actionFor(type: PaymentMethodType, method: IpcmPaymentMethod | null) {
  if (type === "card") return method ? "Replace card" : "Add card";
  return method ? "Replace bank account" : "Connect bank account";
}
function pretty(value: string) {
  return value.split("_").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function nameFor(type: PaymentMethodType, method: IpcmPaymentMethod) {
  const name = type === "card"
    ? (method.cardBrand || method.displayName || "Payment card")
    : (method.bankName || method.displayName || "Bank account");
  const formatted = type === "card" ? pretty(name) : name;
  return method.lastFour ? `${formatted} •••• ${method.lastFour}` : formatted;
}
function secondaryFor(type: PaymentMethodType, method: IpcmPaymentMethod) {
  if (type === "bank_account") return method.bankAccountType ? pretty(method.bankAccountType) : "Bank transfer account";
  return method.displayName && method.displayName.toLowerCase() !== (method.cardBrand || "").toLowerCase()
    ? method.displayName : "Saved for future travel payments";
}

export function PaymentMethodCard({ type, method, canManage, onConfigure }: PaymentMethodCardProps) {
  const isCard = type === "card";
  const title = titleFor(type);
  const status = method?.status ?? "not_connected";
  const statusTone = status === "active" ? "active" : status === "pending" || status === "requires_action" ? "pending" : "neutral";

  return (
    <article className={`orvo-pm-card ${method ? "orvo-pm-card--connected" : "orvo-pm-card--empty"}`}>
      <div className="orvo-pm-card__top">
        <div className={`orvo-pm-card__icon ${isCard ? "orvo-pm-card__icon--card" : "orvo-pm-card__icon--bank"}`}>
          {isCard ? <CardIcon /> : <BankIcon />}
        </div>
        <span className={`orvo-pm-status orvo-pm-status--${statusTone}`}>
          <span className="orvo-pm-status__dot" />{method ? pretty(status) : "Not connected"}
        </span>
      </div>

      <div className="orvo-pm-card__body">
        <p className="orvo-pm-card__eyebrow">{title}</p>
        <h3 className="orvo-pm-card__name">{method ? nameFor(type, method) : isCard ? "No card on file" : "No bank account connected"}</h3>
        <p className="orvo-pm-card__description">
          {method ? secondaryFor(type, method) : isCard
            ? "Add a payment card for future authorized travel purchases."
            : "Connect a bank account to enable authorized ACH payments."}
        </p>
        {method?.isDefault && <span className="orvo-pm-card__default">Default payment method</span>}
      </div>

      <div className="orvo-pm-card__footer">
        <div className="orvo-pm-card__security"><LockIcon /><span>{isCard ? "Card details secured by Stripe" : "Secure bank connection via Stripe"}</span></div>
        {canManage && (
          <button className="orvo-pm-card__action" type="button" onClick={() => onConfigure(type)}>
            <span>{actionFor(type, method)}</span><ArrowIcon />
          </button>
        )}
      </div>
    </article>
  );
}
