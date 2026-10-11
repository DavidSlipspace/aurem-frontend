import {
  useEffect,
  useState
} from "react";

import {
  loadStripe
} from "@stripe/stripe-js";

import {
  confirmAchSetup,
  createAchSetupIntent
} from "../../api/paymentApi";

import type {
  IpcmPaymentProfile
} from "../../types/payment";

type AchSetupModalProps = {
  idToken:
    string;

  profile:
    IpcmPaymentProfile;

  onClose:
    () => void;

  onSaved:
    (
      message:
        string
    ) => Promise<void>;
};

type BankSummary = {
  bankName:
    string;

  lastFour:
    string;

  accountType:
    string;
};

type ExpandedBankPaymentMethod = {
  id?:
    string;

  us_bank_account?: {
    bank_name?:
      string |
      null;

    last4?:
      string |
      null;

    account_type?:
      string |
      null;
  };
};

type ExpandedSetupIntent = {
  id:
    string;

  status:
    string;

  payment_method?:
    | string
    | ExpandedBankPaymentMethod
    | null;
};

function getBankSummary(
  setupIntent:
    ExpandedSetupIntent
): BankSummary {
  const paymentMethod =
    setupIntent
      .payment_method;

  if (
    !paymentMethod ||
    typeof paymentMethod ===
      "string"
  ) {
    return {
      bankName:
        "Bank account",

      lastFour:
        "",

      accountType:
        ""
    };
  }

  return {
    bankName:
      paymentMethod
        .us_bank_account
        ?.bank_name ||
      "Bank account",

    lastFour:
      paymentMethod
        .us_bank_account
        ?.last4 ||
      "",

    accountType:
      paymentMethod
        .us_bank_account
        ?.account_type ||
      ""
  };
}

function formatAccountType(
  value:
    string
): string {
  if (
    !value
  ) {
    return "";
  }

  return value
    .split("_")
    .map(
      (
        part
      ) =>
        part
          .charAt(
            0
          )
          .toUpperCase() +
        part.slice(
          1
        )
    )
    .join(
      " "
    );
}

export function AchSetupModal({
  idToken,
  profile,
  onClose,
  onSaved
}: AchSetupModalProps) {
  const publishableKey =
    import.meta.env
      .VITE_STRIPE_PUBLISHABLE_KEY as
      | string
      | undefined;

  const [
    stripe,
    setStripe
  ] =
    useState<
      Awaited<
        ReturnType<
          typeof loadStripe
        >
      >
    >(null);

  const [
    clientSecret,
    setClientSecret
  ] =
    useState<
      string |
      null
    >(null);

  const [
    setupIntentId,
    setSetupIntentId
  ] =
    useState<
      string |
      null
    >(null);

  const [
    accountHolderName,
    setAccountHolderName
  ] =
    useState(
      `${profile.firstName} ${profile.lastName}`
        .trim()
    );

  const [
    billingEmail,
    setBillingEmail
  ] =
    useState(
      profile.email
    );

  const [
    bankSummary,
    setBankSummary
  ] =
    useState<
      BankSummary |
      null
    >(null);

  const [
    isLoading,
    setIsLoading
  ] =
    useState(
      true
    );

  const [
    isCollecting,
    setIsCollecting
  ] =
    useState(
      false
    );

  const [
    isConfirming,
    setIsConfirming
  ] =
    useState(
      false
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  useEffect(
    () => {
      async function prepareSetup() {
        setIsLoading(
          true
        );

        setErrorMessage(
          ""
        );

        try {
          if (
            !publishableKey
          ) {
            throw new Error(
              "VITE_STRIPE_PUBLISHABLE_KEY is not configured."
            );
          }

          const [
            stripeClient,
            setupResponse
          ] =
            await Promise.all([
              loadStripe(
                publishableKey
              ),

              createAchSetupIntent(
                idToken
              )
            ]);

          if (
            !stripeClient
          ) {
            throw new Error(
              "Unable to initialize Stripe."
            );
          }

          setStripe(
            stripeClient
          );

          setClientSecret(
            setupResponse
              .clientSecret
          );

          setSetupIntentId(
            setupResponse
              .setupIntentId
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to start secure bank account setup."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      }

      void prepareSetup();
    },
    [
      idToken,
      publishableKey
    ]
  );

  async function handleCollectBankAccount() {
    if (
      !stripe ||
      !clientSecret ||
      isCollecting ||
      isConfirming
    ) {
      return;
    }

    const normalizedName =
      accountHolderName
        .trim();

    const normalizedEmail =
      billingEmail
        .trim();

    if (
      !normalizedName
    ) {
      setErrorMessage(
        "Account holder name is required."
      );

      return;
    }

    if (
      !normalizedEmail
    ) {
      setErrorMessage(
        "Billing email is required."
      );

      return;
    }

    setIsCollecting(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const result =
        await stripe
          .collectBankAccountForSetup({
            clientSecret,

            params: {
              payment_method_type:
                "us_bank_account",

              payment_method_data: {
                billing_details: {
                  name:
                    normalizedName,

                  email:
                    normalizedEmail
                }
              }
            },

            expand: [
              "payment_method"
            ]
          });

      if (
        result.error
      ) {
        throw new Error(
          result.error
            .message ||
            "Stripe could not collect the bank account."
        );
      }

      if (
        !result.setupIntent
      ) {
        throw new Error(
          "Stripe did not return a bank account setup session."
        );
      }

      const setupIntent =
        result.setupIntent as
          unknown as
          ExpandedSetupIntent;

      if (
        setupIntent.status ===
          "requires_payment_method"
      ) {
        throw new Error(
          "Bank account connection was canceled or could not be completed."
        );
      }

      if (
        setupIntent.status !==
          "requires_confirmation"
      ) {
        throw new Error(
          `Unexpected bank account setup status: ${setupIntent.status}.`
        );
      }

      setBankSummary(
        getBankSummary(
          setupIntent
        )
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect the bank account."
      );
    } finally {
      setIsCollecting(
        false
      );
    }
  }

  async function handleAuthorizeAndSave() {
    if (
      !stripe ||
      !clientSecret ||
      !setupIntentId ||
      !bankSummary ||
      isCollecting ||
      isConfirming
    ) {
      return;
    }

    setIsConfirming(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const result =
        await stripe
          .confirmUsBankAccountSetup(
            clientSecret
          );

      if (
        result.error
      ) {
        throw new Error(
          result.error
            .message ||
            "Stripe could not authorize this bank account."
        );
      }

      if (
        !result.setupIntent
      ) {
        throw new Error(
          "Stripe did not return the completed bank account setup."
        );
      }

      if (
        result.setupIntent
          .status ===
          "requires_payment_method"
      ) {
        throw new Error(
          "Bank account authorization failed. Please choose a different account or try again."
        );
      }

      const response =
        await confirmAchSetup(
          idToken,
          {
            setupIntentId:
              result
                .setupIntent
                .id ||
              setupIntentId
          }
        );

      await onSaved(
        response.message
      );

      onClose();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the bank account."
      );
    } finally {
      setIsConfirming(
        false
      );
    }
  }

  const authorizationDate =
    new Date()
      .toLocaleDateString(
        "en-US",
        {
          year:
            "numeric",

          month:
            "long",

          day:
            "numeric"
        }
      );

  return (
    <div
      className="payment-modal-backdrop"
      role="presentation"
    >
      <section
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-ach-modal-title"
      >
        <header className="payment-modal-header">
          <div>
            <p className="payment-modal-eyebrow">
              Secure payment setup
            </p>

            <h2
              id="payment-ach-modal-title"
            >
              {profile.bankAccount
                ? "Replace bank account"
                : "Connect bank account"}
            </h2>

            <p>
              Connect the bank
              account that may
              eventually be used
              to fund approved
              travel purchases.
              Bank credentials
              are collected
              directly by Stripe.
            </p>
          </div>

          <button
            type="button"
            className="payment-modal-close"
            onClick={
              onClose
            }
            disabled={
              isCollecting ||
              isConfirming
            }
            aria-label="Close bank account setup"
          >
            ×
          </button>
        </header>

        {isLoading && (
          <div className="payment-card-loading">
            Preparing secure bank
            account setup...
          </div>
        )}

        {errorMessage && (
          <div
            className="payment-card-error"
            role="alert"
          >
            {
              errorMessage
            }
          </div>
        )}

        {!isLoading &&
          stripe &&
          clientSecret &&
          !bankSummary && (
            <>
              <div className="payment-ach-form">
                <label className="payment-ach-field">
                  <span>
                    Account holder
                    name
                  </span>

                  <input
                    type="text"
                    value={
                      accountHolderName
                    }
                    onChange={(
                      event
                    ) =>
                      setAccountHolderName(
                        event
                          .target
                          .value
                      )
                    }
                    autoComplete="name"
                    disabled={
                      isCollecting
                    }
                  />
                </label>

                <label className="payment-ach-field">
                  <span>
                    Billing email
                  </span>

                  <input
                    type="email"
                    value={
                      billingEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setBillingEmail(
                        event
                          .target
                          .value
                      )
                    }
                    autoComplete="email"
                    disabled={
                      isCollecting
                    }
                  />
                </label>
              </div>

              <div className="payment-modal-security-copy">
                <strong>
                  Bank security
                </strong>

                <span>
                  Stripe opens the
                  secure bank
                  connection flow.
                  Orvo never
                  receives your
                  online banking
                  credentials,
                  routing number,
                  or full account
                  number.
                </span>
              </div>

              <div className="payment-modal-actions">
                <button
                  type="button"
                  className="payment-modal-secondary"
                  onClick={
                    onClose
                  }
                  disabled={
                    isCollecting
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="payment-modal-primary"
                  onClick={() =>
                    void handleCollectBankAccount()
                  }
                  disabled={
                    isCollecting
                  }
                >
                  {isCollecting
                    ? "Connecting..."
                    : "Choose Bank Account"}
                </button>
              </div>
            </>
          )}

        {!isLoading &&
          bankSummary && (
            <>
              <div className="payment-ach-bank-summary">
                <p className="payment-method-eyebrow">
                  Selected bank
                  account
                </p>

                <h3>
                  {
                    bankSummary
                      .bankName
                  }

                  {bankSummary
                    .lastFour
                    ? ` •••• ${bankSummary.lastFour}`
                    : ""}
                </h3>

                {bankSummary
                  .accountType && (
                    <p>
                      {formatAccountType(
                        bankSummary
                          .accountType
                      )}
                    </p>
                  )}
              </div>

              <div className="payment-ach-mandate">
                <h3>
                  ACH authorization
                </h3>

                <p>
                  Account holder:{" "}
                  <strong>
                    {
                      accountHolderName
                    }
                  </strong>
                </p>

                <p>
                  Account:{" "}
                  <strong>
                    {
                      bankSummary
                        .bankName
                    }

                    {bankSummary
                      .lastFour
                      ? ` ending in ${bankSummary.lastFour}`
                      : ""}
                  </strong>
                </p>

                <p>
                  Authorization
                  date:{" "}
                  <strong>
                    {
                      authorizationDate
                    }
                  </strong>
                </p>

                <p>
                  By clicking
                  Authorize and
                  Save, you
                  authorize Orvo
                  to debit the bank
                  account specified
                  above for amounts
                  owed in connection
                  with services or
                  purchases you
                  authorize through
                  Orvo, until this
                  authorization is
                  revoked.
                </p>

                <p>
                  If you use Orvo
                  services
                  periodically,
                  you authorize
                  Orvo to debit
                  this bank account
                  periodically for
                  authorized
                  transactions.
                  Payments outside
                  of those
                  authorized uses
                  will require the
                  applicable
                  authorization.
                </p>
              </div>

              <div className="payment-modal-actions">
                <button
                  type="button"
                  className="payment-modal-secondary"
                  onClick={() =>
                    setBankSummary(
                      null
                    )
                  }
                  disabled={
                    isConfirming
                  }
                >
                  Choose Different
                  Account
                </button>

                <button
                  type="button"
                  className="payment-modal-primary"
                  onClick={() =>
                    void handleAuthorizeAndSave()
                  }
                  disabled={
                    isConfirming
                  }
                >
                  {isConfirming
                    ? "Saving bank account..."
                    : "Authorize and Save"}
                </button>
              </div>
            </>
          )}
      </section>
    </div>
  );
}