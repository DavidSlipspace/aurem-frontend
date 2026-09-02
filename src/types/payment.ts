export type PaymentMethodType =
  | "card"
  | "bank_account";

export type PaymentMethodStatus =
  | "pending"
  | "active"
  | "requires_action"
  | "inactive";

export type IpcmPaymentMethod = {
  id: string;

  type:
    PaymentMethodType;

  provider: string;

  displayName:
    | string
    | null;

  cardBrand:
    | string
    | null;

  lastFour:
    | string
    | null;

  bankName:
    | string
    | null;

  bankAccountType:
    | string
    | null;

  status:
    PaymentMethodStatus;

  isDefault:
    boolean;
};

export type IpcmPaymentProfile = {
  userId: string;

  firstName: string;

  lastName: string;

  email: string;

  card:
    | IpcmPaymentMethod
    | null;

  bankAccount:
    | IpcmPaymentMethod
    | null;
};

export type PaymentMethodsResponse = {
  mode:
    "self";

  ipcms:
    IpcmPaymentProfile[];
};

export type PaymentMethodIntakeRequest = {
  type:
    PaymentMethodType;

  displayName?:
    string;

  cardBrand?:
    string;

  lastFour?:
    string;

  bankName?:
    string;

  bankAccountType?:
    string;
};