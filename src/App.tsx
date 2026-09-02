import {
  useState
} from "react";

import {
  LoginPage
} from "./pages/login";

import {
  HomePage
} from "./pages/home";

import {
  TravelerProfilesPage
} from "./pages/travelerProfile";

import {
  TripsPage
} from "./pages/trips";

import {
  BookingLinkPage
} from "./pages/bookingLink";

import {
  PaymentsPage
} from "./pages/payments";

import {
  IpcmsPage
} from "./pages/ipcms";

import {
  Navbar
} from "./components/Navbar";

import type {
  UserResponse
} from "./types/user";

import type {
  CaseResponse
} from "./types/case";

import "./App.css";

type Page =
  | "cases"
  | "travelerProfiles"
  | "trips"
  | "ipcms"
  | "payments";

function getBookingToken():
  | string
  | null {
  const match =
    window.location.pathname.match(
      /^\/booking\/([^/]+)\/?$/
    );

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(
      match[1]
    );
  } catch {
    return null;
  }
}

export default function App() {
  const bookingToken =
    getBookingToken();

  const [
    idToken,
    setIdToken
  ] =
    useState<
      string |
      null
    >(null);

  const [
    user,
    setUser
  ] =
    useState<
      UserResponse |
      null
    >(null);

  const [
    cases,
    setCases
  ] =
    useState<
      CaseResponse[]
    >([]);

  const [
    activePage,
    setActivePage
  ] =
    useState<Page>(
      "cases"
    );

  function handleLoginSuccess(
    token: string,
    userData: UserResponse,
    caseData: CaseResponse[]
  ) {
    setIdToken(
      token
    );

    setUser(
      userData
    );

    setCases(
      caseData
    );

    setActivePage(
      "cases"
    );
  }

  function handleLogout() {
    setIdToken(
      null
    );

    setUser(
      null
    );

    setCases(
      []
    );

    setActivePage(
      "cases"
    );
  }

  if (
    bookingToken
  ) {
    return (
      <BookingLinkPage
        token={
          bookingToken
        }
      />
    );
  }

  if (
    !user ||
    !idToken
  ) {
    return (
      <LoginPage
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }

  return (
    <>
      <Navbar
        user={
          user
        }
        activePage={
          activePage
        }
        onPageChange={
          setActivePage
        }
        onLogout={
          handleLogout
        }
      />

      {activePage ===
        "cases" && (
        <HomePage
          cases={
            cases
          }
        />
      )}

      {activePage ===
        "trips" && (
        <TripsPage
          idToken={
            idToken
          }
        />
      )}

      {activePage ===
        "travelerProfiles" && (
        <TravelerProfilesPage
          idToken={
            idToken
          }
        />
      )}

      {activePage ===
        "ipcms" && (
        <IpcmsPage
          idToken={
            idToken
          }
          user={
            user
          }
        />
      )}

      {activePage ===
        "payments" && (
        <PaymentsPage
          idToken={
            idToken
          }
        />
      )}
    </>
  );
}