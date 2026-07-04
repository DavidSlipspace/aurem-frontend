import type { UserResponse } from "../types/user";
import "./Navbar.css";

type Page = "cases" | "gcProfiles";

type NavbarProps = {
  user: UserResponse;
  activePage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
};

export function Navbar({ user, activePage, onPageChange, onLogout }: NavbarProps) {
  const canManageGcProfiles =
    user.role === "Admin" || user.role === "Case Manager";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">Aurem</div>

        <button
          className={activePage === "cases" ? "nav-link active" : "nav-link"}
          onClick={() => onPageChange("cases")}
        >
          Cases
        </button>

        {canManageGcProfiles && (
          <button
            className={
              activePage === "gcProfiles" ? "nav-link active" : "nav-link"
            }
            onClick={() => onPageChange("gcProfiles")}
          >
            GC Profiles
          </button>
        )}
      </div>

      <div className="navbar-user">
        <span>
          Welcome {user.role}, {user.firstName}
        </span>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}