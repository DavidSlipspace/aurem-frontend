export async function authenticateUser(email: string, password: string): Promise<string> {
  const response = await fetch(import.meta.env.VITE_COGNITO_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? data.__type ?? "Authentication failed.");
  }

  const idToken = data.AuthenticationResult?.IdToken;

  if (!idToken) {
    throw new Error("Authentication succeeded but no ID token was returned.");
  }

  return idToken;
}