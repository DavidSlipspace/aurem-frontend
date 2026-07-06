import { useState } from "react";
import { LoginPage } from "./pages/login";
import { HomePage } from "./pages/home";
import { GcProfilesPage } from "./pages/gcProfile";
import { Navbar } from "./components/Navbar";
import type { UserResponse } from "./types/user";
import type { CaseResponse } from "./types/case";
import "./App.css";
import { TripsPage } from "./pages/trips";

type Page = "cases" | "gcProfiles" | "trips";

export default function App() {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [activePage, setActivePage] = useState<Page>("cases");

  function handleLoginSuccess(
    token: string,
    userData: UserResponse,
    caseData: CaseResponse[]
  ) {
    setIdToken(token);
    setUser(userData);
    setCases(caseData);
    setActivePage("cases");
  }

  function handleLogout() {
    setIdToken(null);
    setUser(null);
    setCases([]);
    setActivePage("cases");
  }

  if (!user || !idToken) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <Navbar
        user={user}
        activePage={activePage}
        onPageChange={setActivePage}
        onLogout={handleLogout}
      />

      {activePage === "cases" && <HomePage cases={cases} />}
      {activePage === "trips" && <TripsPage idToken={idToken} />}

      {activePage === "gcProfiles" && (
        <GcProfilesPage idToken={idToken} />
      )}
    </>
  );
}