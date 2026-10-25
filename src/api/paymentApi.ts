import type {
  PaymentMethodsResponse,
  PaymentComponentKeyResponse,
  SaveCardPaymentMethodRequest,
  SavePaymentMethodResponse,
  CreateAchSetupIntentResponse,
  ConfirmAchSetupRequest,
  ConfirmAchSetupResponse,
  CreateCardSetupIntentResponse,
  ConfirmCardSetupRequest,
  ConfirmCardSetupResponse
} from "../types/payment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request<T>(idToken: string, path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured.");
  const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers
    }
  });
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
      ? data.message : `Payment request failed (${response.status}).`;
    throw new Error(message);
  }
  return data as T;
}

export function getPaymentMethods(idToken: string): Promise<PaymentMethodsResponse> {
  return request(idToken, "/payment-methods");
}

// Legacy Duffel functions retained for compatibility during migration.
export function createPaymentComponentKey(idToken: string): Promise<PaymentComponentKeyResponse> {
  return request(idToken, "/payment-methods/component-key", { method: "POST" });
}
export function saveCardPaymentMethod(idToken: string, payload: SaveCardPaymentMethodRequest): Promise<SavePaymentMethodResponse> {
  return request(idToken, "/payment-methods", { method: "POST", body: JSON.stringify(payload) });
}

// Existing ACH routes are unchanged.
export function createAchSetupIntent(idToken: string): Promise<CreateAchSetupIntentResponse> {
  return request(idToken, "/payment-methods/ach/setup", { method: "POST" });
}
export function confirmAchSetup(idToken: string, payload: ConfirmAchSetupRequest): Promise<ConfirmAchSetupResponse> {
  return request(idToken, "/payment-methods/ach/confirm", { method: "POST", body: JSON.stringify(payload) });
}

export function createCardSetupIntent(idToken: string): Promise<CreateCardSetupIntentResponse> {
  return request(idToken, "/payment-methods/card/setup", { method: "POST" });
}
export function confirmCardSetup(idToken: string, payload: ConfirmCardSetupRequest): Promise<ConfirmCardSetupResponse> {
  return request(idToken, "/payment-methods/card/confirm", { method: "POST", body: JSON.stringify(payload) });
}
