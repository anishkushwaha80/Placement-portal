import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      if (user.role === "company") navigate("/company");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Register as a student or as a company</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          I am a
          <div className="role-toggle">
            <button
              type="button"
              className={form.role === "student" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "student" })}
            >
              Student
            </button>
            <button
              type="button"
              className={form.role === "company" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "company" })}
            >
              Company
            </button>
          </div>
        </label>

        <label>
          {form.role === "company" ? "Company name" : "Full name"}
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={form.role === "company" ? "Acme Pvt Ltd" : "Jane Doe"}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 6 characters"
          />
        </label>

        {form.role === "company" && (
          <p className="hint">
            After registering, your company will appear as <strong>pending</strong> until
            the admin reviews and approves it.
          </p>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
