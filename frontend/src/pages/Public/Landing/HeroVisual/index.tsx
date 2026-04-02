import "./style.css";

// stylized app preview showing the matching workflow
export default function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      {/* mock browser chrome wrapping the preview */}
      <div className="preview-frame">
        <div className="preview-dots">
          <span />
          <span />
          <span />
        </div>

        {/* mock dashboard content */}
        <div className="preview-body">
          {/* job posting card */}
          <div className="preview-card preview-card-job">
            <div className="preview-status open">open</div>
            <p className="preview-card-title">Dental Hygienist</p>
            <p className="preview-card-meta">Smile Dental &middot; $38-45/hr</p>
            <div className="preview-bar">
              <span className="preview-bar-fill" style={{ width: "72%" }} />
            </div>
            <p className="preview-card-hint">3 candidates matched</p>
          </div>

          {/* candidate match card */}
          <div className="preview-card preview-card-match">
            <div className="preview-avatar">J</div>
            <div className="preview-match-body">
              <p className="preview-card-title">Jordan Smith</p>
              <p className="preview-card-meta">RDH &middot; 4 yrs experience</p>
              <div className="preview-badges">
                <span className="preview-badge approved">verified</span>
                <span className="preview-badge available">available</span>
              </div>
            </div>
          </div>

          {/* negotiation card */}
          <div className="preview-card preview-card-neg">
            <div className="preview-neg-header">
              <span className="preview-status active">negotiating</span>
              <span className="preview-timer">12:34</span>
            </div>
            <p className="preview-card-meta">Both parties reviewing terms...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
