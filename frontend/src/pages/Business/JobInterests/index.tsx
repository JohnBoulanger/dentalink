import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import "./style.css";

interface InterestRow {
  interest_id: number;
  mutual: boolean;
  user: { id: number; first_name: string; last_name: string };
}

export default function BusinessJobInterests() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { hasActiveNeg, setHasActiveNeg } = useNegotiation();

  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // job status — needed to block negotiation start on filled/expired/cancelled jobs
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  // per-row negotiation start loading/error
  const [negLoading, setNegLoading] = useState<number | null>(null);
  const [negError, setNegError] = useState<Record<number, string>>({});

  const limit = 10;

  // fetch job status once so we can block negotiation start when the job isn't open
  useEffect(() => {
    api
      .get(`/jobs/${jobId}`)
      .then((res) => setJobStatus(res.data.status))
      .catch(() => {});
  }, [jobId]);

  useEffect(() => {
    async function fetchInterests() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/jobs/${jobId}/interests`, {
          params: { page, limit },
        });
        setInterests(res.data.results);
        setCount(res.data.count);
      } catch {
        setError("Failed to load interests.");
      } finally {
        setLoading(false);
      }
    }
    fetchInterests();
  }, [jobId, page]);

  // start a negotiation from a mutual interest
  async function handleStartNeg(interestId: number) {
    setNegLoading(interestId);
    setNegError((prev) => ({ ...prev, [interestId]: "" }));
    try {
      await api.post("/negotiations", { interest_id: interestId });
      setHasActiveNeg(true);
      navigate("/business/negotiations/me");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          // already exists — navigate there
          setHasActiveNeg(true);
          navigate("/business/negotiations/me");
        } else {
          const msg = err.response?.data?.error || "Failed to start negotiation.";
          setNegError((prev) => ({ ...prev, [interestId]: msg }));
        }
      } else {
        setNegError((prev) => ({ ...prev, [interestId]: "Failed to start negotiation." }));
      }
    } finally {
      setNegLoading(null);
    }
  }

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="BusinessJobInterests page-enter">
      <div className="bji-header">
        <div>
          <Link to={`/business/jobs/${jobId}`} className="back-link">
            ← Job #{jobId}
          </Link>
          <h1>Interests</h1>
        </div>
        <p className="bji-count">
          {count} expression{count !== 1 ? "s" : ""} of interest
        </p>
      </div>

      {/* active negotiation notice — block starting another */}
      {hasActiveNeg && (
        <div className="bji-neg-notice">
          You have an active negotiation in progress.{" "}
          <Link to="/business/negotiations/me">View it</Link> before starting a new one.
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : interests.length === 0 ? (
        <p className="empty-state">No one has expressed interest in this job yet.</p>
      ) : (
        <>
          <div className="bji-list">
            {interests.map((row) => (
              <div key={row.interest_id} className="bji-row">
                <div className="bji-row-left">
                  <Link
                    to={`/business/jobs/${jobId}/candidates/${row.user.id}`}
                    className="bji-user-name"
                  >
                    {row.user.first_name} {row.user.last_name}
                  </Link>
                  {/* mutual = both parties interested → negotiation can be started */}
                  {row.mutual ? (
                    <span className="bji-mutual-badge">Mutual interest</span>
                  ) : (
                    <span className="bji-one-way-badge">Awaiting your invite</span>
                  )}
                </div>

                <div className="bji-row-right">
                  {negError[row.interest_id] && (
                    <span className="error-message small">{negError[row.interest_id]}</span>
                  )}
                  {/* only allow starting a negotiation on open jobs */}
                  {row.mutual && !hasActiveNeg && jobStatus === "open" && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleStartNeg(row.interest_id)}
                      disabled={negLoading === row.interest_id}
                    >
                      {negLoading === row.interest_id ? "Starting..." : "Start negotiation"}
                    </button>
                  )}
                  {/* job filled after successful negotiation */}
                  {row.mutual && jobStatus === "filled" && (
                    <span className="myjob-status-confirmed">Job filled</span>
                  )}
                  <Link
                    to={`/business/jobs/${jobId}/candidates/${row.user.id}`}
                    className="btn-secondary btn-sm"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
