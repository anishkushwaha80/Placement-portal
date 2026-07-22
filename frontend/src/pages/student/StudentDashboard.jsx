import { useEffect, useState } from "react";
import api from "../../api/axios";

const TABS = ["My Profile", "Browse Companies", "My Applications"];

export default function StudentDashboard() {
  const [tab, setTab] = useState("My Profile");
  const [profile, setProfile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ course: "", branch: "", cgpa: "", skills: "", phone: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, companiesRes, applicationsRes] = await Promise.all([
        api.get("/student/me"),
        api.get("/company/list"),
        api.get("/student/applications"),
      ]);
      setProfile(profileRes.data);
      setCompanies(companiesRes.data);
      setApplications(applicationsRes.data);
      setForm({
        course: profileRes.data.course || "",
        branch: profileRes.data.branch || "",
        cgpa: profileRes.data.cgpa || "",
        skills: profileRes.data.skills || "",
        phone: profileRes.data.phone || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/student/me", form);
      setProfile(data.student);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadResume(e) {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please choose a PDF file first.");
      return;
    }
    setUploading(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const { data } = await api.post("/student/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data.student);
      setMessage("Resume uploaded successfully.");
      setResumeFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function applyToCompany(companyId) {
    setMessage("");
    setError("");
    try {
      await api.post(`/student/apply/${companyId}`);
      setMessage("Application submitted!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply");
    }
  }

  const appliedCompanyIds = new Set(applications.map((a) => a.company?.id));

  if (loading) return <div className="page-loading">Loading student dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Manage your profile, browse companies, and track your applications.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "My Profile" && (
        <div className="two-col">
          <form className="card" onSubmit={handleSaveProfile}>
            <h2>Personal &amp; academic details</h2>
            <label>
              Course
              <input
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="e.g. B.Tech"
              />
            </label>
            <label>
              Branch
              <input
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                placeholder="e.g. Computer Science"
              />
            </label>
            <label>
              CGPA
              <input
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                placeholder="e.g. 8.2"
              />
            </label>
            <label>
              Skills
              <textarea
                rows={3}
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. JavaScript, React, Node.js, SQL"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Contact number"
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>

          <form className="card" onSubmit={handleUploadResume}>
            <h2>Resume (PDF)</h2>
            <p className="hint">
              Current resume:{" "}
              {profile?.resumeOriginalName ? (
                <a
                  href={profile.resumePath ? `/uploads/${profile.resumePath}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.resumeOriginalName}
                </a>
              ) : (
                "Not uploaded yet"
              )}
            </p>
            <label>
              Upload / replace resume
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </label>
            <button className="btn btn-primary btn-block" type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload resume"}
            </button>
          </form>
        </div>
      )}

      {tab === "Browse Companies" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Requirements</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.companyName}</td>
                  <td>{c.industry || "—"}</td>
                  <td>{c.location || "—"}</td>
                  <td className="wrap-cell">{c.requirements || "—"}</td>
                  <td>
                    {appliedCompanyIds.has(c.id) ? (
                      <span className="badge badge-pending">Applied</span>
                    ) : (
                      <button className="btn btn-small btn-primary" onClick={() => applyToCompany(c.id)}>
                        Apply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No approved companies yet. Check back soon.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "My Applications" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Applied on</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.applicationId}>
                  <td>{a.company?.companyName}</td>
                  <td>{a.company?.industry || "—"}</td>
                  <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        a.status === "approved" ? "approved" : a.status === "rejected" ? "rejected" : "pending"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    You haven't applied to any company yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
