import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import LoadingSpinner from "../../../components/LoadingSpinner";
import "./style.css";

interface JobDetail {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  business: { id: number; business_name: string };
  note: string;
  salary_min: number;
  salary_max: number;
  start_time: string;
  end_time: string;
  worker: { id: number } | null;
}

// status badge colours
const STATUS_CLASS: Record<string, string> = {
  open: "status-open",
  filled: "status-filled",
  expired: "status-expired",
  cancelled: "status-cancelled",
  completed: "status-completed",
};

export default function JobDetail() {
  const { jobId } = useParams();
  const { hasActiveNeg } = useNegotiation();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // null = unknown/not expressed, true = interested, false = withdrawn
  const [interested, setInterested] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // fetch job and seed interest state from server in parallel
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [jobRes, interestsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get("/users/me/interests?limit=200"),
        ]);
        setJob(jobRes.data);
        // check if this job appears in the user's interest list
        const match = (interestsRes.data.results ?? []).find(
          (i: { job: { id: number } }) => i.job.id === Number(jobId)
        );
        // only set to true if found; otherwise leave as null (show express-interest)
        if (match) setInterested(true);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError("You need an approved qualification for this position to view this job.");
          } else if (err.response?.status === 404) {
            setError("Job not found.");
          } else {
            setError("Failed to load job.");
          }
        } else {
          setError("Failed to load job.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  // toggle interest — drive state from server response
  async function handleInterest(value: boolean) {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await api.patch(`/jobs/${jobId}/interested`, { interested: value });
      // use server-confirmed value rather than local optimism
      setInterested(res.data.candidate?.interested ?? value);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          setActionError("You already have an active negotiation — resolve it first.");
        } else {
          setActionError(err.response?.data?.error || "Action failed.");
        }
      } else {
        setActionError("Action failed.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="JobDetail page-enter">
        <p className="error-message">{error}</p>
        <Link to="/jobs" className="back-link">
          ← Back to jobs
        </Link>
      </div>
    );
  }
  if (!job) return null;

  const isOpen = job.status === "open";

  return (
    <div className="JobDetail page-enter">
      <Link to="/jobs" className="back-link">
        ← Back to jobs
      </Link>

      <div className="job-detail-card">
        {/* header */}
        <div className="job-detail-header">
          <div>
            <h1>{job.position_type.name}</h1>
            <Link to={`/businesses/${job.business.id}`} className="job-detail-business">
              {job.business.business_name}
            </Link>
          </div>
          <span className={`status-badge ${STATUS_CLASS[job.status]}`}>{job.status}</span>
        </div>

        {/* details grid */}
        <div className="job-detail-grid">
          <div className="job-detail-item">
            <span className="detail-label">Salary</span>
            <span className="detail-value">
              ${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()} / hr
            </span>
          </div>
          <div className="job-detail-item">
            <span className="detail-label">Start</span>
            <span className="detail-value">{new Date(job.start_time).toLocaleString()}</span>
          </div>
          <div className="job-detail-item">
            <span className="detail-label">End</span>
            <span className="detail-value">{new Date(job.end_time).toLocaleString()}</span>
          </div>
          <div className="job-detail-item">
            <span className="detail-label">Position</span>
            <span className="detail-value">{job.position_type.name}</span>
          </div>
        </div>

        {/* job notes */}
        {job.note && (
          <div className="job-detail-note">
            <span className="detail-label">Notes</span>
            <p>{job.note}</p>
          </div>
        )}

        {/* interest action — only shown for open jobs */}
        {isOpen && (
          <div className="job-interest-actions">
            {actionError && <p className="error-message">{actionError}</p>}

            {interested === null && (
              <button
                className="btn-primary"
                onClick={() => handleInterest(true)}
                disabled={actionLoading}
              >
                {actionLoading ? "Submitting..." : "Express interest"}
              </button>
            )}

            {interested === true && (
              <div className="interest-confirmed">
                <span className="interest-badge">Interest submitted</span>
                <button
                  className="btn-secondary"
                  onClick={() => handleInterest(false)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Withdrawing..." : "Withdraw interest"}
                </button>
              </div>
            )}

            {interested === false && <p className="interest-withdrawn">Interest withdrawn.</p>}
          </div>
        )}

        {/* active negotiation shortcut — only when there's a live negotiation */}
        {hasActiveNeg && (
          <div className="job-detail-footer">
            <Link to="/negotiations/me" className="btn-secondary">
              View active negotiation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
