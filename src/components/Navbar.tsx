import type {
  UserResponse
} from "../types/user";

import "./Navbar.css";

type Page =
  | "cases"
  | "travelerProfiles"
  | "trips"
  | "ipcms"
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
  const canManageTravelerProfiles =
    user.role ===
      "Admin" ||
    user.role ===
      "Case Manager";

  const canViewIpcmProfiles =
    user.role ===
      "Admin" ||
    user.role ===
      "IPCM";

  const canViewPayments =
    user.role ===
      "Admin" ||
    user.role ===
      "IPCM";

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
          Cases
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
          Trips
        </button>

        {canManageTravelerProfiles && (
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

        {canViewIpcmProfiles && (
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
            IPCM Profiles
          </button>
        )}

        {canViewPayments && (
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