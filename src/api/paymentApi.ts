import type {
  PaymentComponentKeyResponse,
  PaymentMethodsResponse,
  SaveCardPaymentMethodRequest,
  SavePaymentMethodResponse
} from "../types/payment";

const baseUrl =
  import.meta.env
    .VITE_API_BASE_URL;

function getErrorMessage(
  data: unknown,
  fallbackMessage: string
): string {
  if (
    typeof data ===
      "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message ===
      "string"
  ) {
    return data.message;
  }

  return fallbackMessage;
}

async function parseResponseBody(
  response: Response
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type"
    );

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return text
    ? {
        message:
          text
      }
    : {};
}

export async function getPaymentMethods(
  idToken: string
): Promise<PaymentMethodsResponse> {
  const response =
    await fetch(
      `${baseUrl}/payment-methods`,
      {
        method:
          "GET",

        headers: {
          Authorization:
            `Bearer ${idToken}`
        }
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load payment methods."
      )
    );
  }

  return (
    data as
      PaymentMethodsResponse
  );
}

export async function createPaymentComponentKey(
  idToken: string
): Promise<PaymentComponentKeyResponse> {
  const response =
    await fetch(
      `${baseUrl}/payment-methods/component-key`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            {}
          )
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to start secure card setup."
      )
    );
  }

  return (
    data as
      PaymentComponentKeyResponse
  );
}

export async function saveCardPaymentMethod(
  idToken: string,
  payload:
    SaveCardPaymentMethodRequest
): Promise<SavePaymentMethodResponse> {
  const response =
    await fetch(
      `${baseUrl}/payment-methods`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${idToken}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  const data =
    await parseResponseBody(
      response
    );

  if (
    !response.ok
  ) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to save the card."
      )
    );
  }

  return (
    data as
      SavePaymentMethodResponse
  );
}