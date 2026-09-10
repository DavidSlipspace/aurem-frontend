import {
  useEffect,
  useState
} from "react";

import {
  getPaymentMethods
} from "../api/paymentApi";

import {
  AdminPaymentMethodsPanel
} from "../components/payments/AdminPaymentMethodsPanel";

import {
  AchSetupModal
} from "../components/payments/AchSetupModal";

import {
  CardSetupModal
} from "../components/payments/CardSetupModal";

import {
  IpcmPaymentMethodsPanel
} from "../components/payments/IpcmPaymentMethodsPanel";

import {
  PaymentSecurityNotice
} from "../components/payments/PaymentSecurityNotice";

import type {
  IpcmPaymentProfile,
  PaymentMethodType,
  PaymentMethodsResponse
} from "../types/payment";

import "./payments.css";

type PaymentsPageProps = {
  idToken:
    string;
};

export function PaymentsPage({
  idToken
}: PaymentsPageProps) {
  const [
    data,
    setData
  ] =
    useState<
      PaymentMethodsResponse |
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

  const [
    noticeMessage,
    setNoticeMessage
  ] =
    useState("");

  const [
    cardSetupProfile,
    setCardSetupProfile
  ] =
    useState<
      IpcmPaymentProfile |
      null
    >(null);

  const [
    achSetupProfile,
    setAchSetupProfile
  ] =
    useState<
      IpcmPaymentProfile |
      null
    >(null);

  useEffect(
    () => {
      void loadPaymentMethods();
    },
    [
      idToken
    ]
  );

  async function loadPaymentMethods() {
    setIsLoading(
      true
    );

    setErrorMessage(
      ""
    );

    try {
      const response =
        await getPaymentMethods(
          idToken
        );

      setData(
        response
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load payment methods."
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  function handleConfigure(
    profile:
      IpcmPaymentProfile,

    type:
      PaymentMethodType
  ) {
    setNoticeMessage(
      ""
    );

    if (
      type ===
      "card"
    ) {
      setCardSetupProfile(
        profile
      );

      return;
    }

    setAchSetupProfile(
      profile
    );
  }

  async function handleCardSaved() {
    setNoticeMessage(
      "Your travel card was saved successfully."
    );

    await loadPaymentMethods();
  }

  async function handleBankSaved(
    message:
      string
  ) {
    setNoticeMessage(
      message
    );

    await loadPaymentMethods();
  }

  return (
    <main className="payments-page">
      <section className="payments-content">
        <header className="payments-header">
          <div>
            <p className="payments-eyebrow">
              Financial
              administration
            </p>

            <h1>
              Payment Methods
            </h1>

            <p>
              Configure the
              payment sources
              associated with
              your Case Manager
              profile. Sensitive
              payment credentials
              are collected
              directly by the
              payment provider
              and are never stored
              in Aurem.
            </p>
          </div>
        </header>

        {noticeMessage && (
          <div
            className="payments-info-message"
            role="status"
          >
            {
              noticeMessage
            }
          </div>
        )}

        {errorMessage && (
          <div
            className="payments-error-message"
            role="alert"
          >
            <strong>
              Unable to load
              payment methods
            </strong>

            <span>
              {
                errorMessage
              }
            </span>

            <button
              type="button"
              onClick={() =>
                void loadPaymentMethods()
              }
            >
              Try again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="payments-loading">
            Loading payment
            methods...
          </div>
        )}

        {!isLoading &&
          data && (
            <>
              {data.mode ===
              "admin" ? (
                <>
                  <div className="payments-section-heading">
                    <h2>
                      Case Manager
                      payment profiles
                    </h2>

                    <p>
                      Review payment
                      configuration
                      for Case Managers
                      in your company.
                    </p>
                  </div>

                  <AdminPaymentMethodsPanel
                    profiles={
                      data.ipcms
                    }
                    onConfigure={
                      handleConfigure
                    }
                  />
                </>
              ) : (
                <>
                  <div className="payments-section-heading payments-section-heading-centered">
                    <h2>
                      Your payment
                      profile
                    </h2>

                    <p>
                      These payment
                      sources are
                      associated
                      only with your
                      Case Manager
                      profile.
                    </p>
                  </div>

                  {data.ipcms[0] ? (
                    <IpcmPaymentMethodsPanel
                      profile={
                        data.ipcms[0]
                      }
                      canManage
                      showIdentity={
                        false
                      }
                      onConfigure={
                        handleConfigure
                      }
                    />
                  ) : (
                    <div className="payments-empty-state">
                      <h2>
                        Payment
                        profile
                        unavailable
                      </h2>

                      <p>
                        We could not
                        locate your
                        Case Manager
                        payment
                        profile.
                      </p>
                    </div>
                  )}
                </>
              )}

              <PaymentSecurityNotice />
            </>
          )}
      </section>

      {cardSetupProfile && (
        <CardSetupModal
          idToken={
            idToken
          }
          onClose={() =>
            setCardSetupProfile(
              null
            )
          }
          onSaved={
            handleCardSaved
          }
        />
      )}

      {achSetupProfile && (
        <AchSetupModal
          idToken={
            idToken
          }
          profile={
            achSetupProfile
          }
          onClose={() =>
            setAchSetupProfile(
              null
            )
          }
          onSaved={
            handleBankSaved
          }
        />
      )}
    </main>
  );
}