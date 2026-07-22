import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const dashboardPath = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "company"
      ? "/company"
      : "/student"
    : "/";

  return (
    <header className="navbar">
      <Link to={dashboardPath} className="brand">
        <span className="brand-mark">P</span>
        <span>Placement Portal</span>
      </Link>

      <nav className="nav-links">
        {user ? (
          <>
            <span className="nav-user">
              {user.name} <span className="role-chip">{user.role}</span>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
