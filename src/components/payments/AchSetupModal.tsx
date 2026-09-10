import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";

import {
  loadStripe
} from "@stripe/stripe-js";

import {
  confirmAchSetup,
  createAchSetupIntent
} from "../../api/paymentApi";

type AchSetupModalProps = {
  idToken:
    string;

  onClose:
    () => void;

  onSaved:
    (
      message:
        string
    ) => Promise<void>;
};

type AchSetupFormProps = {
  idToken:
    string;

  setupIntentId:
    string;

  onClose:
    () => void;

  onSaved:
    (
      message:
        string
    ) => Promise<void>;
};

function AchSetupForm({
  idToken,
  setupIntentId,
  onClose,
  onSaved
}: AchSetupFormProps) {
  const stripe =
    useStripe();

  const elements =
    useElements();

  const [
    isSaving,
    setIsSaving
  ] =
    useState(
      false
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  async function handleSave() {
    if (
      !stripe ||
      !elements ||
      isSaving
    ) {
      return;
    }

    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const result =
        await stripe
          .confirmSetup({
            elements,

            confirmParams: {
              return_url:
                window
                  .location
                  .href
            },

            redirect:
              "if_required"
          });

      if (
        result.error
      ) {
        throw new Error(
          result.error
            .message ||
            "Stripe could not save this bank account."
        );
      }

      const confirmedSetupIntentId =
        result.setupIntent
          ?.id ||
        setupIntentId;

      const response =
        await confirmAchSetup(
          idToken,
          {
            setupIntentId:
              confirmedSetupIntentId
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
      setIsSaving(
        false
      );
    }
  }

  return (
    <>
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

      <div className="payment-stripe-ach-form">
        <PaymentElement
          options={{
            layout:
              "tabs"
          }}
        />
      </div>

      <div className="payment-modal-security-copy">
        <strong>
          Bank account security
        </strong>

        <span>
          Your bank credentials
          are collected directly
          by Stripe. Aurem stores
          only the Stripe payment
          reference and masked
          account metadata.
        </span>
      </div>

      <div className="payment-ach-note">
        Stripe may verify your
        account instantly through
        your bank login. If manual
        verification is required,
        Stripe may send
        microdeposit instructions.
      </div>

      <div className="payment-modal-actions">
        <button
          type="button"
          className="payment-modal-secondary"
          onClick={
            onClose
          }
          disabled={
            isSaving
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="payment-modal-primary"
          onClick={() =>
            void handleSave()
          }
          disabled={
            !stripe ||
            !elements ||
            isSaving
          }
        >
          {isSaving
            ? "Saving bank account..."
            : "Save Bank Account"}
        </button>
      </div>
    </>
  );
}

export function AchSetupModal({
  idToken,
  onClose,
  onSaved
}: AchSetupModalProps) {
  const publishableKey =
    import.meta.env
      .VITE_STRIPE_PUBLISHABLE_KEY as
      | string
      | undefined;

  const stripePromise =
    useMemo(
      () =>
        publishableKey
          ? loadStripe(
              publishableKey
            )
          : null,
      [
        publishableKey
      ]
    );

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
    isLoading,
    setIsLoading
  ] =
    useState(
      true
    );

  const [
    errorMessage,
    setErrorMessage
  ] =
    useState("");

  useEffect(
    () => {
      async function loadSetupIntent() {
        if (
          !publishableKey
        ) {
          setErrorMessage(
            "VITE_STRIPE_PUBLISHABLE_KEY is not configured."
          );

          setIsLoading(
            false
          );

          return;
        }

        setIsLoading(
          true
        );

        setErrorMessage(
          ""
        );

        try {
          const response =
            await createAchSetupIntent(
              idToken
            );

          setClientSecret(
            response.clientSecret
          );

          setSetupIntentId(
            response.setupIntentId
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

      void loadSetupIntent();
    },
    [
      idToken,
      publishableKey
    ]
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
              Connect bank account
            </h2>

            <p>
              Connect the bank
              account that will
              eventually fund
              travel purchases.
              Aurem never receives
              or stores your full
              routing or account
              number.
            </p>
          </div>

          <button
            type="button"
            className="payment-modal-close"
            onClick={
              onClose
            }
            aria-label="Close bank account setup"
          >
            ×
          </button>
        </header>

        {isLoading && (
          <div className="payment-card-loading">
            Preparing secure bank
            account form...
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
          !errorMessage &&
          stripePromise &&
          clientSecret &&
          setupIntentId && (
            <Elements
              stripe={
                stripePromise
              }
              options={{
                clientSecret,

                appearance: {
                  theme:
                    "stripe"
                }
              }}
            >
              <AchSetupForm
                idToken={
                  idToken
                }
                setupIntentId={
                  setupIntentId
                }
                onClose={
                  onClose
                }
                onSaved={
                  onSaved
                }
              />
            </Elements>
          )}
      </section>
    </div>
  );
}