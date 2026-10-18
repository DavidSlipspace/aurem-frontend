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
  ProfilePage
} from "./pages/profile";

import {
  IpcmOnboardingPage
} from "./pages/ipcmOnboarding";

import {
  ResetPasswordPage
} from "./pages/resetPassword";

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
  | "profile"
  | "payments";

function getPathToken(
  pattern: RegExp
):
  | string
  | null {
  const match =
    window.location.pathname.match(
      pattern
    );

  if (
    !match?.[1]
  ) {
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

function getBookingToken():
  | string
  | null {
  return getPathToken(
    /^\/booking\/([^/]+)\/?$/
  );
}

function getIpcmInvitationToken():
  | string
  | null {
  return getPathToken(
    /^\/ipcm\/invite\/([^/]+)\/?$/
  );
}

function getPasswordResetDetails(): {
  isResetPage: boolean;
  email: string;
  code: string;
} {
  if (
    !/^\/reset-password\/?$/.test(
      window.location.pathname
    )
  ) {
    return {
      isResetPage: false,
      email: "",
      code: ""
    };
  }

  const searchParams =
    new URLSearchParams(
      window.location.search
    );

  const hashParams =
    new URLSearchParams(
      window.location.hash.replace(
        /^#/,
        ""
      )
    );

  return {
    isResetPage: true,

    email:
      searchParams.get(
        "email"
      ) ?? "",

    code:
      hashParams.get(
        "code"
      ) ?? ""
  };
}

export default function App() {
  const bookingToken =
    getBookingToken();

  const ipcmInvitationToken =
    getIpcmInvitationToken();

  const passwordReset =
    getPasswordResetDetails();

  const [
    idToken,
    setIdToken
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    user,
    setUser
  ] =
    useState<
      UserResponse |
      null
    >(
      null
    );

  const [
    cases,
    setCases
  ] =
    useState<
      CaseResponse[]
    >(
      []
    );

  const [
    activePage,
    setActivePage
  ] =
    useState<Page>(
      "cases"
    );

  function handleLoginSuccess(
    token: string,
    userData:
      UserResponse,
    caseData:
      CaseResponse[]
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

  function handleUserUpdated(
    updatedUser:
      UserResponse
  ) {
    setUser(
      updatedUser
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
    ipcmInvitationToken
  ) {
    return (
      <IpcmOnboardingPage
        token={
          ipcmInvitationToken
        }
      />
    );
  }

  if (
    passwordReset
      .isResetPage
  ) {
    return (
      <ResetPasswordPage
        initialEmail={
          passwordReset.email
        }
        initialCode={
          passwordReset.code
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
          idToken={
            idToken
          }
          cases={
            cases
          }
          user={
            user
          }
          onCasesChanged={
            setCases
          }
        />
      )}

      {activePage ===
        "trips" && (
        <TripsPage
          idToken={
            idToken
          }
          user={
            user
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
        "profile" && (
        <ProfilePage
          idToken={
            idToken
          }
          user={
            user
          }
          onUserUpdated={
            handleUserUpdated
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