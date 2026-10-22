
type CognitoErrorResponse = {
  __type?: string;
  message?: string;
};

type CognitoAuthResponse = {
  ChallengeName?: string;
  Session?: string;
  ChallengeParameters?: {
    USER_ID_FOR_SRP?: string;
    USERNAME?: string;
    requiredAttributes?: string;
  };
  AuthenticationResult?: {
    IdToken?: string;
  };
};

export type AuthenticationResult =
  | {
      status: "authenticated";
      idToken: string;
    }
  | {
      status: "new_password_required";
      session: string;
      username: string;
    };

const cognitoUrl =
  import.meta.env.VITE_COGNITO_AUTH_URL;

const clientId =
  import.meta.env.VITE_COGNITO_CLIENT_ID;

async function cognitoRequest<T>(
  target: string,
  body: unknown
): Promise<T> {
  const response = await fetch(cognitoUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target":
        `AWSCognitoIdentityProviderService.${target}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json() as
    T & CognitoErrorResponse;

  if (!response.ok) {
    const error = new Error(
      data.message ??
      data.__type ??
      "Cognito request failed."
    );

    error.name =
      data.__type?.split("#").pop() ??
      "CognitoError";

    throw error;
  }

  return data;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticationResult> {
  const normalizedEmail =
    email.trim().toLowerCase();

  const data =
    await cognitoRequest<CognitoAuthResponse>(
      "InitiateAuth",
      {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: normalizedEmail,
          PASSWORD: password
        }
      }
    );

  if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    if (!data.Session) {
      throw new Error(
        "Cognito did not return a password challenge session. Please try signing in again."
      );
    }

    return {
      status: "new_password_required",
      session: data.Session,
      username:
        data.ChallengeParameters?.USERNAME ??
        data.ChallengeParameters?.USER_ID_FOR_SRP ??
        normalizedEmail
    };
  }

  const idToken =
    data.AuthenticationResult?.IdToken;

  if (idToken) {
    return {
      status: "authenticated",
      idToken
    };
  }

  if (data.ChallengeName) {
    throw new Error(
      `Additional authentication is required: ${data.ChallengeName}.`
    );
  }

  throw new Error(
    "Authentication succeeded but no ID token was returned."
  );
}

export async function completeNewPasswordChallenge(
  username: string,
  session: string,
  newPassword: string
): Promise<string> {
  try {
    const data =
      await cognitoRequest<CognitoAuthResponse>(
        "RespondToAuthChallenge",
        {
          ClientId: clientId,
          ChallengeName: "NEW_PASSWORD_REQUIRED",
          Session: session,
          ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: newPassword
          }
        }
      );

    const idToken =
      data.AuthenticationResult?.IdToken;

    if (idToken) {
      return idToken;
    }

    if (data.ChallengeName) {
      throw new Error(
        `Additional authentication is required: ${data.ChallengeName}.`
      );
    }

    throw new Error(
      "Password was submitted, but Cognito did not return an ID token. Please sign in again."
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "InvalidPasswordException") {
        throw new Error(
          "The new password does not meet the password requirements."
        );
      }

      if (
        error.name === "NotAuthorizedException" ||
        error.name === "ExpiredCodeException"
      ) {
        throw new Error(
          "Your password setup session has expired. Please return to sign in and try again."
        );
      }
    }

    throw error;
  }
}

export async function requestPasswordReset(
  email: string
): Promise<void> {
  const normalizedEmail =
    email.trim().toLowerCase();

  try {
    await cognitoRequest(
      "ForgotPassword",
      {
        ClientId: clientId,
        Username: normalizedEmail
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
        error.name === "UserNotFoundException" ||
        error.name === "InvalidParameterException"
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
        ClientId: clientId,
        Username: email.trim().toLowerCase(),
        ConfirmationCode:
          confirmationCode.trim(),
        Password: newPassword
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === "CodeMismatchException"
      ) {
        throw new Error(
          "This password reset link is invalid. Request a new reset email."
        );
      }

      if (
        error.name === "ExpiredCodeException"
      ) {
        throw new Error(
          "This password reset link has expired. Request a new reset email."
        );
      }

      if (
        error.name === "InvalidPasswordException"
      ) {
        throw new Error(
          "The new password does not meet the password requirements."
        );
      }
    }

    throw error;
  }
}
