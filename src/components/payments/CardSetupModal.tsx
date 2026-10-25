import { useEffect, useRef, useState, type FormEvent } from "react";
import { loadStripe, type Stripe, type StripeCardElement, type StripeElements } from "@stripe/stripe-js";
import { createCardSetupIntent, confirmCardSetup } from "../../api/paymentApi";

type CardSetupModalProps = {
  idToken: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null);

export function CardSetupModal({ idToken, onClose, onSaved }: CardSetupModalProps) {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<StripeCardElement | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let card: StripeCardElement | null = null;
    async function initialize() {
      try {
        if (!publishableKey) throw new Error("Stripe publishable key is not configured.");
        const [stripe, setup] = await Promise.all([stripePromise, createCardSetupIntent(idToken)]);
        if (!stripe) throw new Error("Stripe could not be initialized.");
        if (cancelled) return;
        stripeRef.current = stripe;
        setClientSecret(setup.clientSecret);
        const elements = stripe.elements();
        elementsRef.current = elements;
        card = elements.create("card", { hidePostalCode: false });
        card.on("change", (event) => {
          if (cancelled) return;
          setIsValid(event.complete);
          setErrorMessage(event.error?.message ?? null);
        });
        if (!cardContainerRef.current) throw new Error("Card form is not available.");
        card.mount(cardContainerRef.current);
        cardRef.current = card;
      } catch (error) {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : "Unable to initialize card setup.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      card?.destroy();
      cardRef.current = null;
      elementsRef.current = null;
      stripeRef.current = null;
    };
  }, [idToken]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || !authorized || !isValid || !cardholderName.trim()) return;
    const stripe = stripeRef.current;
    const card = cardRef.current;
    if (!stripe || !card || !clientSecret) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card,
          billing_details: { name: cardholderName.trim() }
        }
      });
      if (result.error) throw new Error(result.error.message || "Stripe could not save this card.");
      if (!result.setupIntent || result.setupIntent.status !== "succeeded") {
        throw new Error("Card setup is not complete. Please follow any required authentication steps.");
      }
      await confirmCardSetup(idToken, { setupIntentId: result.setupIntent.id });
      await onSaved();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save card.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .orvo-card-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(12, 24, 42, .62); backdrop-filter: blur(3px); }
        .orvo-card-modal { width: 100%; max-width: 510px; max-height: calc(100vh - 40px); overflow-y: auto; border-radius: 18px; background: #fff; color: #17243a; box-shadow: 0 24px 80px rgba(0,0,0,.25); font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif; }
        .orvo-card-modal * { box-sizing: border-box; }
        .orvo-card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 26px 30px 20px; border-bottom: 1px solid #e9edf2; }
        .orvo-card-header h2 { margin: 0; font-size: 22px; line-height: 1.3; font-weight: 700; }
        .orvo-card-subtitle { margin: 6px 0 0; color: #66758b; font-size: 13px; line-height: 1.5; }
        .orvo-card-close { border: 0; background: #f3f5f8; color: #526176; font-size: 23px; line-height: 1; width: 34px; height: 34px; border-radius: 9px; cursor: pointer; }
        .orvo-card-body { padding: 24px 30px 20px; display: flex; flex-direction: column; gap: 18px; }
        .orvo-card-field { display: flex; flex-direction: column; gap: 8px; }
        .orvo-card-field label { display: block; font-size: 13px; font-weight: 650; color: #27364c; }
        .orvo-card-name { width: 100%; height: 46px; padding: 0 14px; border: 1px solid #cbd4e0; border-radius: 9px; font: inherit; font-size: 15px; background: #fff; color: #17243a; }
        .orvo-card-name:focus { outline: 2px solid #a8c5ef; border-color: #4378b7; }
        .orvo-card-element { min-height: 48px; padding: 14px; border: 1px solid #cbd4e0; border-radius: 9px; background: #fff; }
        .orvo-card-consent { display: flex; gap: 11px; align-items: flex-start; padding: 15px; background: #f7f9fc; border: 1px solid #e5eaf1; border-radius: 10px; font-size: 12px; line-height: 1.6; color: #344258; cursor: pointer; }
        .orvo-card-consent input { margin: 3px 0 0; flex-shrink: 0; width: 16px; height: 16px; accent-color: #245d9b; }
        .orvo-card-security { display: flex; gap: 8px; align-items: flex-start; margin: 0; color: #6c7a8f; font-size: 12px; line-height: 1.55; }
        .orvo-card-error { margin: 0; padding: 12px 14px; border-radius: 8px; background: #fff1f0; color: #a52924; font-size: 13px; line-height: 1.5; }
        .orvo-card-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 18px 30px 26px; border-top: 1px solid #e9edf2; }
        .orvo-card-actions button { min-height: 44px; border-radius: 9px; padding: 0 20px; font-size: 14px; font-weight: 650; cursor: pointer; }
        .orvo-card-cancel { background: #fff; border: 1px solid #cbd4e0; color: #33435a; }
        .orvo-card-save { background: #245d9b; border: 1px solid #245d9b; color: #fff; }
        .orvo-card-actions button:disabled { opacity: .55; cursor: not-allowed; }
        @media (max-width: 540px) { .orvo-card-header { padding: 20px; } .orvo-card-body { padding: 20px; } .orvo-card-actions { padding: 16px 20px 20px; } }
      `}</style>
    <div className="orvo-card-overlay" role="presentation">
      <section className="orvo-card-modal" role="dialog" aria-modal="true" aria-label="Add credit card">
        <div className="orvo-card-header">
          <div><h2>Add credit card</h2><p className="orvo-card-subtitle">Securely save a card for future travel payments.</p></div>
          <button type="button" onClick={onClose} disabled={isSaving} className="orvo-card-close" aria-label="Close">×</button>
        </div>
        <form onSubmit={(event) => { void handleSave(event); }}>
          <div className="orvo-card-body">
            <div className="orvo-card-field"><label htmlFor="stripe-cardholder-name">Name on card</label>
            <input className="orvo-card-name" id="stripe-cardholder-name" autoComplete="cc-name" value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)} disabled={isSaving} placeholder="Full name as shown on card" required /></div>
            <div className="orvo-card-field"><label>Card details</label>
            <div ref={cardContainerRef} className="orvo-card-element" /></div>
            {isLoading && <p>Loading secure card form…</p>}
            <label className="orvo-card-consent">
              <input type="checkbox" checked={authorized} disabled={isSaving}
                onChange={(event) => setAuthorized(event.target.checked)} />
              I am the cardholder or am authorized to save this card for future travel-related charges under Orvo's disclosed payment terms.
            </label>
            <p className="orvo-card-security">Card details are collected securely by Stripe. Orvo does not receive your full card number or CVC.</p>
            {errorMessage && <p role="alert" className="orvo-card-error">{errorMessage}</p>}
          </div>
          <div className="orvo-card-actions">
            <button type="button" className="orvo-card-cancel" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="orvo-card-save"
              disabled={isLoading || isSaving || !isValid || !authorized || !cardholderName.trim() || !clientSecret}>
              {isSaving ? "Saving card…" : "Save card"}
            </button>
          </div>
        </form>
      </section>
    </div>
    </>
  );
}
