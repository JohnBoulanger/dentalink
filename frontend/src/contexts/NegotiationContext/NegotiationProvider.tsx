import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import api from "../../utils/api";
import { useAuth } from "../AuthContext/AuthContext";
import NegotiationContext from "./NegotiationContext";

export default function NegotiationProvider({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth();
  const navigate = useNavigate();
  const [hasActiveNeg, setHasActiveNeg] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // check for an active negotiation when user logs in
  useEffect(() => {
    if (!token || role !== "regular") return;

    api
      .get("/negotiations/me")
      .then(() => setHasActiveNeg(true))
      .catch(() => setHasActiveNeg(false));
  }, [token, role]);

  // maintain a global socket to catch negotiation:started from any page
  useEffect(() => {
    if (!token || role !== "regular") return;

    const socket = io(backendUrl, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // when a new negotiation starts, mark active and navigate there
    socket.on("negotiation:started", () => {
      setHasActiveNeg(true);
      navigate("/negotiations/me");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, role, backendUrl, navigate]);

  return (
    <NegotiationContext.Provider value={{ hasActiveNeg, setHasActiveNeg }}>
      {children}
    </NegotiationContext.Provider>
  );
}
