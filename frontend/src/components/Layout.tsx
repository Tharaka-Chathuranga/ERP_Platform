import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/** App shell: top bar with the current user + nav, and the routed content. */
export function Layout() {
  const { username, roles, logout } = useAuth();
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">ERP&nbsp;Platform</div>
        <nav className="nav">
          <NavLink to="/items">Items</NavLink>
        </nav>
        <div className="spacer" />
        <div className="user">
          <span>
            {username} <small>({roles.join(", ")})</small>
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
