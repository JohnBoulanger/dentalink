import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import { useNegotiation } from "../../../contexts/NegotiationContext/NegotiationContext";
import Pagination from "../../../components/Pagination";
import LoadingSpinner from "../../../components/LoadingSpinner";
import "./style.css";

// shared job row shape
interface JobEntry {
  id: number;
  status: string;
  position_type: { id: number; name: string };
  business: { id: number; business_name: string };
  salary_min: number;
  salary_max: number;
  start_time: string;
}

interface Interest {
  interest_id: number;
  mutual: boolean;
  job: JobEntry;
}

type Tab = "interests" | "invitations";

export default function MyJobs() {
  const navigate = useNavigate();
  const { hasActiveNeg, setHasActiveNeg } = useNegotiation();
  const [tab, setTab] = useState<Tab>("interests");

  // interests state
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsCount, setInterestsCount] = useState(0);
  const [interestsPage, setInterestsPage] = useState(1);

  // invitations state
  const [invitations, setInvitations] = useState<JobEntry[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [invitationsPage, setInvitationsPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [negotiationLoading, setNegotiationLoading] = useState<number | null>(null);
  const limit = 10;

  // fetch whichever tab is active; reset error between tab switches
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (tab === "interests") {
          const res = await api.get("/users/me/interests", {
            params: { page: interestsPage, limit },
          });
          setInterests(res.data.results);
          setInterestsCount(res.data.count);
        } else {
          const res = await api.get("/users/me/invitations", {
            params: { page: invitationsPage, limit },
          });
          setInvitations(res.data.results);
          setInvitationsCount(res.data.count);
        }
      } catch {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab, interestsPage, invitationsPage]);

  // start negotiation from a mutual interest
  async function handleStartNegotiation(interestId: number) {
    setNegotiationLoading(interestId);
    try {
      await api.post("/negotiations", { interest_id: interestId });
      setHasActiveNeg(true);
      navigate("/negotiations/me");
    } catch (err) {
      // 409 = negotiation already exists, just navigate there
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setHasActiveNeg(true);
        navigate("/negotiations/me");
      }
    } finally {
      setNegotiationLoading(null);
    }
  }

  const interestsTotalPages = Math.ceil(interestsCount / limit);
  const invitationsTotalPages = Math.ceil(invitationsCount / limit);

  return (
    <div className="MyJobs page-enter">
      <h1>My jobs</h1>

      {/* active negotiation banner */}
      {hasActiveNeg && (
        <div className="myjobs-neg-banner">
          You have an active negotiation. <Link to="/negotiations/me">View it →</Link>
        </div>
      )}

      {/* tab switcher */}
      <div className="myjobs-tabs">
        <button
          className={tab === "interests" ? "tab active" : "tab"}
          onClick={() => setTab("interests")}
        >
          My interests
          {interestsCount > 0 && <span className="tab-count">{interestsCount}</span>}
        </button>
        <button
          className={tab === "invitations" ? "tab active" : "tab"}
          onClick={() => setTab("invitations")}
        >
          Invitations
          {invitationsCount > 0 && <span className="tab-count">{invitationsCount}</span>}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : tab === "interests" ? (
        <>
          {interests.length === 0 ? (
            <p className="empty-state">
              No interests yet — <Link to="/jobs">browse jobs</Link>
            </p>
          ) : (
            <div className="myjobs-list">
              {interests.map((item) => (
                <div key={item.interest_id} className="myjob-row">
                  <div className="myjob-row-info">
                    <Link to={`/jobs/${item.job.id}`} className="myjob-title">
                      {item.job.position_type.name}
                    </Link>
                    <span className="myjob-business">{item.job.business.business_name}</span>
                    <span className="myjob-date">
                      {new Date(item.job.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="myjob-row-actions">
                    {/* mutual interest — show negotiation button or in-progress label */}
                    {item.mutual &&
                      (hasActiveNeg ? (
                        <Link to="/negotiations/me" className="btn-secondary btn-sm">
                          Negotiation in progress
                        </Link>
                      ) : (
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => handleStartNegotiation(item.interest_id)}
                          disabled={negotiationLoading === item.interest_id}
                        >
                          {negotiationLoading === item.interest_id
                            ? "Starting..."
                            : "Start negotiation"}
                        </button>
                      ))}
                    {!item.mutual && (
                      <span className="myjob-status-pending">Pending business response</span>
                    )}
                    <span className={`status-dot status-${item.job.status}`}>
                      {item.job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            page={interestsPage}
            totalPages={interestsTotalPages}
            onPageChange={setInterestsPage}
          />
        </>
      ) : (
        <>
          {invitations.length === 0 ? (
            <p className="empty-state">No invitations yet</p>
          ) : (
            <div className="myjobs-list">
              {invitations.map((job) => (
                <div key={job.id} className="myjob-row">
                  <div className="myjob-row-info">
                    <Link to={`/jobs/${job.id}`} className="myjob-title">
                      {job.position_type.name}
                    </Link>
                    <span className="myjob-business">{job.business.business_name}</span>
                    <span className="myjob-date">
                      {new Date(job.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="myjob-row-actions">
                    {/* invitation: user hasn't responded yet — express interest on job detail */}
                    <Link to={`/jobs/${job.id}`} className="btn-secondary btn-sm">
                      View &amp; respond
                    </Link>
                    <span className={`status-dot status-${job.status}`}>{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination
            page={invitationsPage}
            totalPages={invitationsTotalPages}
            onPageChange={setInvitationsPage}
          />
        </>
      )}
    </div>
  );
}
