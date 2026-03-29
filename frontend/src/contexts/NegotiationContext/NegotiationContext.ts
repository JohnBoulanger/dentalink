import { createContext, useContext } from "react";

interface NegotiationContextValue {
  // whether the current user has a live active negotiation
  hasActiveNeg: boolean;
  setHasActiveNeg: (v: boolean) => void;
}

const NegotiationContext = createContext<NegotiationContextValue>({
  hasActiveNeg: false,
  setHasActiveNeg: () => {},
});

export function useNegotiation() {
  return useContext(NegotiationContext);
}

export default NegotiationContext;
