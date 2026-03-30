import { useState } from "react";
import axios from "axios";
import api from "../../../utils/api";
import "../Users/style.css";
import "./style.css";

// each system setting — endpoint, label, display unit, and multiplier to convert to native api unit
interface SettingConfig {
  key: string;
  endpoint: string;
  field: string;
  label: string;
  description: string;
  unit: "minutes" | "days";
  // multiplier converts the display value to the native unit the backend service expects
  multiplier: number;
  min: number;
}

const SETTINGS: SettingConfig[] = [
  {
    key: "negotiation_window",
    endpoint: "/system/negotiation-window",
    field: "negotiation_window",
    label: "Negotiation window",
    description: "How long each negotiation stays active before expiring.",
    unit: "minutes",
    multiplier: 60_000, // minutes → milliseconds (service uses ms arithmetic)
    min: 1,
  },
  {
    key: "reset_cooldown",
    endpoint: "/system/reset-cooldown",
    field: "reset_cooldown",
    label: "Password reset cooldown",
    description: "Minimum time between activation / reset token requests.",
    unit: "minutes",
    multiplier: 60, // minutes → seconds (service compares elapsed seconds)
    min: 0,
  },
  {
    key: "job_start_window",
    endpoint: "/system/job-start-window",
    field: "job_start_window",
    label: "Job start window",
    description: "How close to shift start a no-show can be reported.",
    unit: "days",
    multiplier: 1, // days → days (service converts days to ms internally)
    min: 1,
  },
  {
    key: "availability_timeout",
    endpoint: "/system/availability-timeout",
    field: "availability_timeout",
    label: "Availability timeout",
    description: "Inactivity period after which a user is no longer discoverable.",
    unit: "days",
    multiplier: 86_400, // days → seconds (service compares elapsed seconds)
    min: 1,
  },
];

interface SettingState {
  value: string; // display value (string for input)
  saving: boolean;
  saved: boolean;
  error: string;
}

const DEFAULT_STATE: SettingState = { value: "", saving: false, saved: false, error: "" };

export default function AdminSettings() {
  // each setting has its own independent state
  const [states, setStates] = useState<Record<string, SettingState>>(
    Object.fromEntries(SETTINGS.map((s) => [s.key, { ...DEFAULT_STATE }]))
  );

  function updateState(key: string, patch: Partial<SettingState>) {
    setStates((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  async function handleSave(cfg: SettingConfig) {
    const raw = parseFloat(states[cfg.key].value);
    if (isNaN(raw) || raw < cfg.min) {
      updateState(cfg.key, { error: `Must be at least ${cfg.min} ${cfg.unit}.` });
      return;
    }
    // convert display unit to the native unit the backend service expects
    const nativeValue = raw * cfg.multiplier;
    updateState(cfg.key, { saving: true, error: "", saved: false });
    try {
      await api.patch(cfg.endpoint, { [cfg.field]: nativeValue });
      updateState(cfg.key, { saving: false, saved: true, value: String(raw) });
      // clear the "saved" checkmark after 2s
      setTimeout(() => updateState(cfg.key, { saved: false }), 2000);
    } catch (err) {
      updateState(cfg.key, {
        saving: false,
        error: axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save."
          : "Failed to save.",
      });
    }
  }

  return (
    <div className="AdminSettings page-enter">
      <div className="admin-page-header">
        <div>
          <h1>System Settings</h1>
          <p className="admin-subtitle">Platform-wide configuration values</p>
        </div>
      </div>

      {/* no GET endpoints exist for these settings — inputs start blank intentionally */}
      <p className="admin-muted settings-notice">
        Current values cannot be fetched from the server. Enter the desired new value and press Save
        to update each setting.
      </p>

      <div className="settings-grid">
        {SETTINGS.map((cfg) => {
          const s = states[cfg.key];
          return (
            <div key={cfg.key} className="settings-card">
              <div className="settings-card-header">
                <h3>{cfg.label}</h3>
                <p className="admin-muted">{cfg.description}</p>
              </div>

              <div className="settings-input-row">
                <input
                  type="number"
                  min={cfg.min}
                  step={1}
                  placeholder={cfg.unit === "days" ? "e.g. 7" : "e.g. 15"}
                  value={s.value}
                  onChange={(e) =>
                    updateState(cfg.key, { value: e.target.value, error: "", saved: false })
                  }
                  className="settings-input"
                />
                <span className="settings-unit">{cfg.unit}</span>
                <button
                  className="btn-primary btn-sm"
                  disabled={s.saving || !s.value}
                  onClick={() => handleSave(cfg)}
                >
                  {s.saving ? "Saving…" : s.saved ? "✓ Saved" : "Save"}
                </button>
              </div>

              {s.error && <p className="settings-error">{s.error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
