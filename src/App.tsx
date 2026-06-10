import { FormEvent, useState } from "react";
import axios from "axios";
import "./App.css";

type GetUserResponse = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  welcomeMessage: string;
};

export default function App() {
  const [email, setEmail] = useState("dhoffman1155@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<GetUserResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const authResponse = await axios.post(
        import.meta.env.VITE_COGNITO_AUTH_URL,
        {
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password
          }
        },
        {
          headers: {
            "Content-Type": "application/x-amz-json-1.1",
            "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
          }
        }
      );

      const idToken = authResponse.data.AuthenticationResult?.IdToken;

      if (!idToken) {
        throw new Error("Authentication succeeded but no ID token was returned.");
      }

      const userResponse = await axios.get<GetUserResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/getUser`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      setUser(userResponse.data);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        console.error("Request URL:", error.config?.url);
        console.error("Status:", error.response?.status);
        console.error("Response Data:", error.response?.data);

        setErrorMessage(
          error.response?.data?.message ??
            error.response?.data?.__type ??
            `Request failed with status ${error.response?.status ?? "unknown"}`
        );
      } else {
        setErrorMessage("Unexpected login error.");
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setPassword("");
    setErrorMessage("");
  }

  if (user) {
    return (
      <main className="page">
        <section className="card">
          <h1>{user.welcomeMessage}</h1>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Aurem</h1>
        <p className="subtitle">Sign in to continue</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}