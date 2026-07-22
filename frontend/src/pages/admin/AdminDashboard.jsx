import { useEffect, useState } from "react";
import api from "../../api/axios";

const TABS = ["Overview", "Companies", "Students", "Applications"];

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [statsRes, companiesRes, studentsRes, applicationsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/companies"),
        api.get("/admin/students"),
        api.get("/admin/applications"),
      ]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data);
      setStudents(studentsRes.data);
      setApplications(applicationsRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateCompanyStatus(id, status) {
    try {
      await api.put(`/admin/companies/${id}`, { status });
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    }
  }

  if (loading) return <div className="page-loading">Loading admin dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Approve companies and monitor every student, company, and placement.</p>
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <div className="stats-grid">
          <StatCard label="Total students" value={stats.totalStudents} />
          <StatCard label="Total companies" value={stats.totalCompanies} />
          <StatCard label="Pending company approvals" value={stats.pendingCompanies} accent />
          <StatCard label="Approved companies" value={stats.approvedCompanies} />
          <StatCard label="Total applications" value={stats.totalApplications} />
          <StatCard label="Approved placements" value={stats.approvedApplications} accent />
        </div>
      )}

      {tab === "Companies" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Industry</th>
                <th>Requirements</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>{c.companyName}</td>
                  <td>{c.email}</td>
                  <td>{c.industry || "—"}</td>
                  <td className="wrap-cell">{c.requirements || "—"}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="actions-cell">
                    {c.status !== "approved" && (
                      <button className="btn btn-small btn-success" onClick={() => updateCompanyStatus(c.id, "approved")}>
                        Approve
                      </button>
                    )}
                    {c.status !== "rejected" && (
                      <button className="btn btn-small btn-danger" onClick={() => updateCompanyStatus(c.id, "rejected")}>
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No companies have registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Students" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course / Branch</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.accountName}</td>
                  <td>{s.email}</td>
                  <td>
                    {s.course || "—"} {s.branch ? `/ ${s.branch}` : ""}
                  </td>
                  <td>{s.cgpa || "—"}</td>
                  <td className="wrap-cell">{s.skills || "—"}</td>
                  <td>
                    {s.resumePath ? (
                      <a href={s.resumePath} target="_blank" rel="noreferrer">
                        View PDF
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No students have registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Applications" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Company</th>
                <th>Applied on</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.applicationId}>
                  <td>{a.studentName}</td>
                  <td>{a.studentEmail}</td>
                  <td>{a.companyName}</td>
                  <td>{new Date(a.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No applications have been submitted yet.
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

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card ${accent ? "accent" : ""}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "badge-pending",
    applied: "badge-pending",
    approved: "badge-approved",
    rejected: "badge-rejected",
  };
  return <span className={`badge ${map[status] || ""}`}>{status}</span>;
}
