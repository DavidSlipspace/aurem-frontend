import type {
  IpcmPaymentMethod,
  PaymentMethodType
} from "../../types/payment";

type PaymentMethodCardProps = {
  type: PaymentMethodType;

  method:
    | IpcmPaymentMethod
    | null;

  canManage: boolean;

  onConfigure:
    (
      type:
        PaymentMethodType
    ) => void;
};

function getTitle(
  type: PaymentMethodType
): string {
  return type === "card"
    ? "Travel card"
    : "Bank account";
}

function getActionLabel(
  type: PaymentMethodType,
  method:
    | IpcmPaymentMethod
    | null
): string {
  if (
    type === "card"
  ) {
    return method
      ? "Replace card"
      : "Add card";
  }

  return method
    ? "Manage bank"
    : "Connect bank account";
}

function formatStatus(
  status: string
): string {
  return status
    .split("_")
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function getPrimaryLabel(
  type: PaymentMethodType,
  method: IpcmPaymentMethod
): string {
  if (
    type === "card"
  ) {
    const brand =
      method.cardBrand ||
      method.displayName ||
      "Card";

    return method.lastFour
      ? `${brand} •••• ${method.lastFour}`
      : brand;
  }

  const bankName =
    method.bankName ||
    method.displayName ||
    "Bank account";

  return method.lastFour
    ? `${bankName} •••• ${method.lastFour}`
    : bankName;
}

function getSecondaryLabel(
  type: PaymentMethodType,
  method: IpcmPaymentMethod
): string | null {
  if (
    type === "card"
  ) {
    return (
      method.displayName &&
      method.displayName !==
        method.cardBrand
    )
      ? method.displayName
      : null;
  }

  return (
    method.bankAccountType
  );
}

export function PaymentMethodCard({
  type,
  method,
  canManage,
  onConfigure
}: PaymentMethodCardProps) {
  const title =
    getTitle(type);

  const secondaryLabel =
    method
      ? getSecondaryLabel(
          type,
          method
        )
      : null;

  return (
    <article className="payment-method-card">
      <div className="payment-method-card-header">
        <div
          className="payment-method-icon"
          aria-hidden="true"
        >
          {type === "card"
            ? "▰"
            : "⌂"}
        </div>

        <div>
          <p className="payment-method-eyebrow">
            {title}
          </p>

          <h3>
            {method
              ? getPrimaryLabel(
                  type,
                  method
                )
              : `No ${title.toLowerCase()} configured`}
          </h3>
        </div>
      </div>

      {method ? (
        <>
          {secondaryLabel && (
            <p className="payment-method-detail">
              {secondaryLabel}
            </p>
          )}

          <div className="payment-method-meta">
            <span
              className={
                `payment-method-status ` +
                `status-${method.status}`
              }
            >
              {formatStatus(
                method.status
              )}
            </span>

            {method.isDefault && (
              <span className="payment-method-default">
                Default
              </span>
            )}
          </div>
        </>
      ) : (
        <p className="payment-method-empty-copy">
          {type === "card"
            ? "Add the IPCM travel card that will eventually be used for supplier purchases."
            : "Connect the IPCM bank account that may be used as an agency funding source."}
        </p>
      )}

      {canManage && (
        <button
          type="button"
          className="payment-method-action"
          onClick={() =>
            onConfigure(type)
          }
        >
          {getActionLabel(
            type,
            method
          )}
        </button>
      )}
    </article>
  );
}