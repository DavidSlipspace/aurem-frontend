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
  idToken: string;
};

function getMethodName(
  type: PaymentMethodType
): string {
  return type === "card"
    ? "card"
    : "bank account";
}

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
    useState(true);

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

  useEffect(
    () => {
      loadPaymentMethods();
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
    } catch (error) {
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
    const fullName =
      `${profile.firstName} ${profile.lastName}`.trim();

    setNoticeMessage(
      `Secure ${getMethodName(
        type
      )} setup for ${fullName} is the next payment milestone. No financial credentials are collected by this screen yet.`
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth"
    });
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
              IPCMs in your
              organization.
              Each IPCM may
              have one travel
              card and one
              bank account
              connection.
            </p>
          </div>
        </header>

        {noticeMessage && (
          <div
            className="payments-info-message"
            role="status"
          >
            {noticeMessage}
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
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={
                loadPaymentMethods
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
                      IPCM payment
                      profiles
                    </h2>

                    <p>
                      As an Admin,
                      you can manage
                      payment
                      configuration
                      for IPCMs in
                      your company.
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
                  <div className="payments-section-heading">
                    <h2>
                      Your payment
                      profile
                    </h2>

                    <p>
                      These payment
                      sources are
                      associated
                      only with
                      your IPCM
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
                        IPCM payment
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
    </main>
  );
}