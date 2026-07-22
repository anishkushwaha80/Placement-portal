import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, applicantsRes] = await Promise.all([
        api.get("/company/me"),
        api.get("/company/applicants"),
      ]);
      setProfile(profileRes.data);
      setApplicants(applicantsRes.data);
      setForm({
        companyName: profileRes.data.companyName || "",
        industry: profileRes.data.industry || "",
        location: profileRes.data.location || "",
        website: profileRes.data.website || "",
        description: profileRes.data.description || "",
        requirements: profileRes.data.requirements || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load company data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/company/me", form);
      setProfile(data.company);
      setMessage("Company details saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  }

  async function decideApplicant(applicationId, status) {
    try {
      await api.put(`/company/applicants/${applicationId}`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }
  }

  if (loading) return <div className="page-loading">Loading company dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <p>
          Status:{" "}
          {profile && (
            <span className={`badge badge-${profile.status === "approved" ? "approved" : profile.status === "rejected" ? "rejected" : "pending"}`}>
              {profile.status}
            </span>
          )}
        </p>
        {profile?.status === "pending" && (
          <p className="hint">
            Your company is awaiting admin approval. You can still fill in your
            details below — the admin will review them.
          </p>
        )}
        {profile?.status === "rejected" && (
          <p className="hint hint-danger">
            Your company registration was rejected by the admin. Update your
            details and contact the admin if you believe this was a mistake.
          </p>
        )}
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="two-col">
        <form className="card" onSubmit={handleSave}>
          <h2>Company details &amp; requirements</h2>

          <label>
            Company name
            <input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              required
            />
          </label>

          <label>
            Industry
            <input
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="e.g. IT Services, Finance, Manufacturing"
            />
          </label>

          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, Country"
            />
          </label>

          <label>
            Website
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://example.com"
            />
          </label>

          <label>
            About the company
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A short description of your company"
            />
          </label>

          <label>
            Student requirements
            <textarea
              rows={4}
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              placeholder="e.g. B.Tech CSE/IT, CGPA 7+, skills: React, Node.js"
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save details"}
          </button>
        </form>

        <div className="card">
          <h2>Applicants ({applicants.length})</h2>
          {profile?.status !== "approved" && (
            <p className="hint">
              Applicants will start applying once the admin approves your company.
            </p>
          )}

          <div className="applicant-list">
            {applicants.map((a) => (
              <div className="applicant-item" key={a.applicationId}>
                <div className="applicant-info">
                  <strong>{a.student?.name}</strong>
                  <span>{a.student?.email}</span>
                  <span>
                    {a.student?.course} {a.student?.branch ? `/ ${a.student.branch}` : ""} · CGPA{" "}
                    {a.student?.cgpa || "—"}
                  </span>
                  <span className="wrap-cell">Skills: {a.student?.skills || "—"}</span>
                  {a.student?.resumePath && (
                    <a href={a.student.resumePath} target="_blank" rel="noreferrer">
                      View resume (PDF)
                    </a>
                  )}
                </div>
                <div className="applicant-actions">
                  <span className={`badge badge-${a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending"}`}>
                    {a.status}
                  </span>
                  {a.status === "applied" && (
                    <div className="actions-cell">
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => decideApplicant(a.applicationId, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => decideApplicant(a.applicationId, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {applicants.length === 0 && <p className="empty-cell">No applicants yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
