import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Placement Portal</h1>
        <p>
          One platform connecting the admin, hiring companies, and students —
          from company approval to final placement.
        </p>

        {!user && (
          <div className="home-actions">
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
          </div>
        )}
      </div>

      <div className="home-grid">
        <div className="home-card">
          <span className="home-card-index">01</span>
          <h3>Admin</h3>
          <p>
            Reviews and approves company registrations, and monitors every
            student, company, and placement outcome from one dashboard.
          </p>
        </div>
        <div className="home-card">
          <span className="home-card-index">02</span>
          <h3>Company</h3>
          <p>
            Registers, submits hiring requirements, and — once approved by the
            admin — reviews student applicants and approves the right fits.
          </p>
        </div>
        <div className="home-card">
          <span className="home-card-index">03</span>
          <h3>Student</h3>
          <p>
            Registers, builds a profile with a resume upload, and applies to
            approved companies while tracking application status.
          </p>
        </div>
      </div>
    </div>
  );
}
