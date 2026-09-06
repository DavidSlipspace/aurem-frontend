import type {
  UserResponse
} from "../types/user";

import "./Navbar.css";

type Page =
  | "cases"
  | "travelerProfiles"
  | "trips"
  | "ipcms"
  | "profile"
  | "payments";

type NavbarProps = {
  user:
    UserResponse;

  activePage:
    Page;

  onPageChange:
    (
      page: Page
    ) => void;

  onLogout:
    () => void;
};

export function Navbar({
  user,
  activePage,
  onPageChange,
  onLogout
}: NavbarProps) {
  const isAdmin =
    user.role ===
    "Admin";

  const isCaseManager =
    user.role ===
    "Case Manager";

  const isIpcm =
    user.role ===
    "IPCM";

  const canManageTravel =
    isAdmin ||
    isCaseManager;

  return (
    <nav
      className="navbar"
      aria-label="Primary navigation"
    >
      <div className="navbar-left">
        <div className="navbar-brand">
          Aurem
        </div>

        <button
          type="button"
          className={
            activePage ===
            "cases"
              ? "nav-link active"
              : "nav-link"
          }
          onClick={() =>
            onPageChange(
              "cases"
            )
          }
        >
          {isIpcm
            ? "My Cases"
            : "Cases"}
        </button>

        <button
          type="button"
          className={
            activePage ===
            "trips"
              ? "nav-link active"
              : "nav-link"
          }
          onClick={() =>
            onPageChange(
              "trips"
            )
          }
        >
          {isIpcm
            ? "My Trips"
            : "Trips"}
        </button>

        {canManageTravel && (
          <button
            type="button"
            className={
              activePage ===
              "travelerProfiles"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              onPageChange(
                "travelerProfiles"
              )
            }
          >
            Traveler Profiles
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            className={
              activePage ===
              "ipcms"
                ? "nav-link active"
                : "nav-link"
            }
            onClick={() =>
              onPageChange(
                "ipcms"
              )
            }
          >
            Case Managers
          </button>
        )}

        {isIpcm && (
          <>
            <button
              type="button"
              className={
                activePage ===
                "profile"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                onPageChange(
                  "profile"
                )
              }
            >
              My Profile
            </button>

            <button
              type="button"
              className={
                activePage ===
                "payments"
                  ? "nav-link active"
                  : "nav-link"
              }
              onClick={() =>
                onPageChange(
                  "payments"
                )
              }
            >
              Payments
            </button>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span>
          Welcome {user.role},{" "}
          {user.firstName}
        </span>

        <button
          type="button"
          className="logout-button"
          onClick={
            onLogout
          }
        >
          Logout
        </button>
      </div>
    </nav>
  );
}