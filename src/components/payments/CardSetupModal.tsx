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
    <div className="payment-modal-overlay" role="presentation">
      <section className="payment-modal" role="dialog" aria-modal="true" aria-label="Add credit card">
        <div className="payment-modal-header">
          <h2>Add credit card</h2>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Close">×</button>
        </div>
        <form onSubmit={(event) => { void handleSave(event); }}>
          <div className="payment-modal-body">
            <label htmlFor="stripe-cardholder-name">Name on card</label>
            <input id="stripe-cardholder-name" autoComplete="cc-name" value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)} disabled={isSaving} required />
            <label>Card details</label>
            <div ref={cardContainerRef} className="payment-modal-card-element" style={{ minHeight: 44, padding: "12px 8px" }} />
            {isLoading && <p>Loading secure card form…</p>}
            <label className="payment-modal-consent">
              <input type="checkbox" checked={authorized} disabled={isSaving}
                onChange={(event) => setAuthorized(event.target.checked)} />
              I am the cardholder or am authorized to save this card for future travel-related charges under Orvo's disclosed payment terms.
            </label>
            <p className="payment-modal-security-copy">Card details are collected securely by Stripe. Orvo does not receive your full card number or CVC.</p>
            {errorMessage && <p role="alert" className="payment-modal-error">{errorMessage}</p>}
          </div>
          <div className="payment-modal-actions">
            <button type="button" className="payment-modal-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="submit" className="payment-modal-primary"
              disabled={isLoading || isSaving || !isValid || !authorized || !cardholderName.trim() || !clientSecret}>
              {isSaving ? "Saving card…" : "Save card"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
