import {
  useEffect,
  useState
} from "react";

import {
  DuffelCardForm,
  useDuffelCardFormActions
} from "@duffel/components";

import {
  createPaymentComponentKey,
  saveCardPaymentMethod
} from "../../api/paymentApi";

type CardSetupModalProps = {
  idToken:
    string;

  onClose:
    () => void;

  onSaved:
    () => Promise<void>;
};

function formatCardBrand(
  brand: string
): string {
  return brand
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

export function CardSetupModal({
  idToken,
  onClose,
  onSaved
}: CardSetupModalProps) {
  const {
    ref,
    saveCard
  } =
    useDuffelCardFormActions();

  const [
    componentClientKey,
    setComponentClientKey
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
    isValid,
    setIsValid
  ] =
    useState(
      false
    );

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

  useEffect(
    () => {
      async function loadComponentKey() {
        setIsLoading(
          true
        );

        setErrorMessage(
          ""
        );

        try {
          const response =
            await createPaymentComponentKey(
              idToken
            );

          setComponentClientKey(
            response.componentClientKey
          );
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to start secure card setup."
          );
        } finally {
          setIsLoading(
            false
          );
        }
      }

      void loadComponentKey();
    },
    [
      idToken
    ]
  );

  async function handleSaveSuccess(
    card: {
      id: string;

      last_4_digits:
        string;

      brand:
        string;
    }
  ) {
    setIsSaving(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const formattedBrand =
        formatCardBrand(
          card.brand
        );

      await saveCardPaymentMethod(
        idToken,
        {
          type:
            "card",

          providerPaymentMethodId:
            card.id,

          displayName:
            `${formattedBrand} ending in ${card.last_4_digits}`,

          cardBrand:
            formattedBrand,

          lastFour:
            card.last_4_digits
        }
      );

      await onSaved();

      onClose();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the card."
      );
    } finally {
      setIsSaving(
        false
      );
    }
  }

  function handleSaveFailure(
    error: {
      message?: string;
    }
  ) {
    setIsSaving(
      false
    );

    setErrorMessage(
      error.message ||
        "Duffel could not save this card."
    );
  }

  function handleSave() {
    if (
      !isValid ||
      isSaving
    ) {
      return;
    }

    setErrorMessage(
      ""
    );

    setIsSaving(
      true
    );

    try {
      const result =
        saveCard();

      if (
        result &&
        typeof (
          result as Promise<unknown>
        ).catch ===
          "function"
      ) {
        void (
          result as Promise<unknown>
        ).catch(
          (
            error:
              unknown
          ) => {
            setIsSaving(
              false
            );

            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to save the card."
            );
          }
        );
      }
    } catch (
      error
    ) {
      setIsSaving(
        false
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the card."
      );
    }
  }

  return (
    <div
      className="payment-modal-backdrop"
      role="presentation"
    >
      <section
        className="payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-card-modal-title"
      >
        <header className="payment-modal-header">
          <div>
            <p className="payment-modal-eyebrow">
              Secure payment setup
            </p>

            <h2
              id="payment-card-modal-title"
            >
              Add travel card
            </h2>

            <p>
              Your card details
              are entered directly
              into Duffel's secure
              card component.
              Aurem stores only
              the card reference,
              brand, and last four
              digits.
            </p>
          </div>

          <button
            type="button"
            className="payment-modal-close"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            aria-label="Close card setup"
          >
            ×
          </button>
        </header>

        {isLoading && (
          <div className="payment-card-loading">
            Preparing secure card
            form...
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
          componentClientKey && (
            <>
              <div className="payment-duffel-card-form">
                <DuffelCardForm
                  ref={
                    ref
                  }
                  clientKey={
                    componentClientKey
                  }
                  intent="to-save-card"
                  onValidateSuccess={() =>
                    setIsValid(
                      true
                    )
                  }
                  onValidateFailure={() =>
                    setIsValid(
                      false
                    )
                  }
                  onSaveCardSuccess={
                    handleSaveSuccess
                  }
                  onSaveCardFailure={
                    handleSaveFailure
                  }
                  styles={{
                    input: {
                      default: {
                        "font-size":
                          "15px",

                        color:
                          "#101828",

                        "border-radius":
                          "8px"
                      },

                      focus: {
                        "border-color":
                          "#111827"
                      }
                    },

                    label: {
                      color:
                        "#344054",

                      "font-size":
                        "13px",

                      "font-weight":
                        "700"
                    },

                    inputErrorMessage: {
                      color:
                        "#b42318"
                    },

                    sectionTitle: {
                      color:
                        "#101828",

                      "font-weight":
                        "800"
                    }
                  }}
                />
              </div>

              <div className="payment-modal-security-copy">
                <strong>
                  Card security
                </strong>

                <span>
                  Aurem never
                  receives or
                  stores the full
                  card number or
                  CVC.
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
                    isSaving
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="payment-modal-primary"
                  onClick={
                    handleSave
                  }
                  disabled={
                    !isValid ||
                    isSaving
                  }
                >
                  {isSaving
                    ? "Saving card..."
                    : "Save Card"}
                </button>
              </div>
            </>
          )}
      </section>
    </div>
  );
}