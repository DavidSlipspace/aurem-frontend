export function PaymentSecurityNotice() {
  return (
    <aside className="payment-security-notice">
      <div
        className="payment-security-icon"
        aria-hidden="true"
      >
        ✓
      </div>

      <div>
        <h3>
          Payment security
        </h3>

        <p>
          Aurem is designed to
          store only provider
          references and masked
          payment metadata.
          Full card numbers,
          CVCs, online banking
          credentials, and raw
          bank account numbers
          will not be stored in
          Aurem.
        </p>
      </div>
    </aside>
  );
}