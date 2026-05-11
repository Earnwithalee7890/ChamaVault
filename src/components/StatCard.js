"use client";

export default function StatCard({ label, value, subValue, icon, variant = "default" }) {
  const isEmerald = variant === "emerald";
  
  return (
    <div className={`glass-card stat-card ${variant}`}>
      <div className="stat-icon-wrapper">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-content">
        <label className="stat-label">{label}</label>
        <div className={`stat-value ${isEmerald ? "text-gradient" : ""}`}>{value}</div>
        {subValue && <div className="stat-subvalue">{subValue}</div>}
      </div>

      <style jsx>{`
        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          opacity: 0.03;
          border-radius: 50%;
          transform: translate(20%, 20%);
        }
        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 1px solid var(--border-glass);
        }
        .emerald .stat-icon-wrapper {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.2);
        }
        .stat-content {
          flex: 1;
        }
        .stat-label {
          display: block;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
        }
        .stat-subvalue {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
