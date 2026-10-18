type CognitoErrorResponse = {
  __type?: string;
  message?: string;
};

type CognitoAuthResponse = {
  AuthenticationResult?: {
    IdToken?: string;
  };
};

const cognitoUrl =
  import.meta.env
    .VITE_COGNITO_AUTH_URL;

const clientId =
  import.meta.env
    .VITE_COGNITO_CLIENT_ID;

async function cognitoRequest<T>(
  target: string,
  body: unknown
): Promise<T> {
  const response =
    await fetch(
      cognitoUrl,
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/x-amz-json-1.1",

          "X-Amz-Target":
            `AWSCognitoIdentityProviderService.${target}`
        },

        body:
          JSON.stringify(
            body
          )
      }
    );

  const data =
    await response.json() as
      T &
      CognitoErrorResponse;

  if (!response.ok) {
    const error =
      new Error(
        data.message ??
        data.__type ??
        "Cognito request failed."
      );

    error.name =
      data.__type
        ?.split("#")
        .pop() ??
      "CognitoError";

    throw error;
  }

  return data;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<string> {
  const data =
    await cognitoRequest<CognitoAuthResponse>(
      "InitiateAuth",
      {
        AuthFlow:
          "USER_PASSWORD_AUTH",

        ClientId:
          clientId,

        AuthParameters: {
          USERNAME:
            email
              .trim()
              .toLowerCase(),

          PASSWORD:
            password
        }
      }
    );

  const idToken =
    data.AuthenticationResult
      ?.IdToken;

  if (!idToken) {
    throw new Error(
      "Authentication succeeded but no ID token was returned."
    );
  }

  return idToken;
}

export async function requestPasswordReset(
  email: string
): Promise<void> {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  try {
    await cognitoRequest(
      "ForgotPassword",
      {
        ClientId:
          clientId,

        Username:
          normalizedEmail
      }
    );
  } catch (error) {
    /*
     * Do not reveal whether an account exists.
     * Cognito's app client also has
     * PreventUserExistenceErrors enabled.
     */
    if (
      error instanceof Error &&
      (
        error.name ===
          "UserNotFoundException" ||
        error.name ===
          "InvalidParameterException"
      )
    ) {
      return;
    }

    throw error;
  }
}

export async function confirmPasswordReset(
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> {
  try {
    await cognitoRequest(
      "ConfirmForgotPassword",
      {
        ClientId:
          clientId,

        Username:
          email
            .trim()
            .toLowerCase(),

        ConfirmationCode:
          confirmationCode
            .trim(),

        Password:
          newPassword
      }
    );
  } catch (error) {
    if (
      error instanceof Error
    ) {
      if (
        error.name ===
        "CodeMismatchException"
      ) {
        throw new Error(
          "This password reset link is invalid. Request a new reset email."
        );
      }

      if (
        error.name ===
        "ExpiredCodeException"
      ) {
        throw new Error(
          "This password reset link has expired. Request a new reset email."
        );
      }

      if (
        error.name ===
        "InvalidPasswordException"
      ) {
        throw new Error(
          "The new password does not meet the password requirements."
        );
      }
    }

    throw error;
  }
}