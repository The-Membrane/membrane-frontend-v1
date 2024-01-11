interface QueueStatsItemProps {
    metric: number | string;
    label: string;
    color?: string;
  }
  
  export function QueueStatsItem({ metric, label, color }: QueueStatsItemProps) {
    return (
      <div className="queue-stats-item">
        <div style={{textAlign: "center", borderBottom: `2px solid ${color}`, fontSize: "large"}}>{metric}</div>
        <div className="collateral-tvl-label">{label}</div>
      </div>
    );
  }