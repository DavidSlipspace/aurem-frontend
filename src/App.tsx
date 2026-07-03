import { useState } from "react";
import { LoginPage } from "./pages/login";
import { HomePage } from "./pages/home";
import type { UserResponse } from "./types/user";
import type { CaseResponse } from "./types/case";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [cases, setCases] = useState<CaseResponse[]>([]);

  function handleLoginSuccess(userData: UserResponse, caseData: CaseResponse[]) {
    setUser(userData);
    setCases(caseData);
  }

  function handleLogout() {
    setUser(null);
    setCases([]);
  }

  if (user) {
    return <HomePage user={user} cases={cases} onLogout={handleLogout} />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}