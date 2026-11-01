import type { UserResponse } from "../types/user";
import { getRoleDisplayName, isAdmin, isCaseManager } from "../utils/userRoles";

type Page = "cases" | "travelerProfiles" | "trips" | "ipcms" | "profile" | "payments";
type NavbarProps = {
  user: UserResponse;
  activePage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
};

export function Navbar({ user, activePage, onPageChange, onLogout }: NavbarProps) {
  const admin = isAdmin(user);
  const manager = isCaseManager(user);
  const links: { page: Page; label: string }[] = [
    { page: "cases", label: manager ? "My Cases" : "Cases" },
    { page: "trips", label: manager ? "My Trips" : "Trips" }
  ];
  if (admin || manager) links.push({ page: "travelerProfiles", label: "Traveler Profiles" });
  if (admin) links.push({ page: "ipcms", label: "Case Managers" });
  if (manager) {
    links.push({ page: "profile", label: "My Profile" });
    links.push({ page: "payments", label: "Payments" });
  }
  return (
    <header className="navbar">
      <div className="navbar-brand">Orvo</div>
      <nav aria-label="Main navigation" className="navbar-links">
        {links.map(({ page, label }) => (
          <button key={page} type="button"
            className={activePage === page ? "navbar-link active" : "navbar-link"}
            aria-current={activePage === page ? "page" : undefined}
            onClick={() => onPageChange(page)}>{label}</button>
        ))}
      </nav>
      <div className="navbar-user">
        <span>Welcome {getRoleDisplayName(user)}, {user.firstName}</span>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
