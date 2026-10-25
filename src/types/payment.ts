export type PaymentMethodType = "card" | "bank_account";
export type PaymentMethodStatus = "pending" | "active" | "requires_action" | "inactive";

export type IpcmPaymentMethod = {
  id: string;
  type: PaymentMethodType;
  provider: string;
  displayName: string;
  cardBrand: string | null;
  lastFour: string | null;
  bankName: string | null;
  bankAccountType: string | null;
  status: PaymentMethodStatus;
  isDefault: boolean;
};

export type IpcmPaymentProfile = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  card: IpcmPaymentMethod | null;
  bankAccount: IpcmPaymentMethod | null;
};

export type PaymentMethodsResponse = {
  mode: "admin" | "self";
  ipcms: IpcmPaymentProfile[];
};

// Retained for compatibility with existing Duffel code during migration.
export type PaymentComponentKeyResponse = { componentClientKey: string };
export type SaveCardPaymentMethodRequest = {
  type: "card";
  providerPaymentMethodId: string;
  displayName: string;
  cardBrand: string;
  lastFour: string;
};
export type SavePaymentMethodResponse = { message: string };

export type CreateAchSetupIntentResponse = {
  clientSecret: string;
  setupIntentId: string;
};
export type ConfirmAchSetupRequest = { setupIntentId: string };
export type ConfirmAchSetupResponse = {
  message: string;
  status: PaymentMethodStatus;
  paymentMethod: {
    provider: "stripe";
    providerPaymentMethodId: string;
    bankName: string | null;
    lastFour: string | null;
    bankAccountType: string | null;
  };
};

export type CreateCardSetupIntentResponse = {
  clientSecret: string;
  setupIntentId: string;
};
export type ConfirmCardSetupRequest = {
  setupIntentId: string;
  displayName?: string;
};
export type ConfirmCardSetupResponse = {
  message: string;
  status: "active";
  paymentMethod: {
    provider: "stripe";
    providerPaymentMethodId: string;
    cardBrand: string;
    lastFour: string;
  };
};
