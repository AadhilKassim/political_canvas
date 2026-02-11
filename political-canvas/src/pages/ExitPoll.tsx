import { useEffect, useState } from 'react';
import { getVoters } from '../api';

const PARTY_COLORS: { [key: string]: string } = {
  UDF: '#2196F3',
  LDF: '#F44336',
  BJP: '#FF9800',
  Others: '#9E9E9E'
};

export default function ExitPoll({ token }: { token: string }) {
  const [poll, setPoll] = useState<{ [party: string]: number }>({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVoters(token);
        if (!Array.isArray(data)) {
          setError(data?.error || 'Failed to load exit poll data.');
          setPoll({});
          setTotal(0);
          return;
        }
        const counts: { [party: string]: number } = { UDF: 0, LDF: 0, BJP: 0, Others: 0 };
        let totalCount = 0;
        data.forEach((v: any) => {
          if (counts.hasOwnProperty(v.party)) {
            counts[v.party]++;
          } else {
            counts['Others']++;
          }
          totalCount++;
        });
        setError('');
        setPoll(counts);
        setTotal(totalCount);
      } catch (err) {
        setError('Failed to load exit poll data.');
        setPoll({});
        setTotal(0);
      }
    };
    fetchData();
  }, [token]);

  // Calculate SVG segments for donut chart
  const createDonutSegments = () => {
    if (total === 0) return [];
    
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    let currentAngle = -90; // Start from top
    
    return Object.entries(poll).map(([party, count]) => {
      const percentage = (count / total) * 100;
      const angle = (count / total) * 360;
      const dashArray = `${(count / total) * circumference} ${circumference}`;
      
      const segment = {
        party,
        count,
        percentage,
        color: PARTY_COLORS[party] || '#9E9E9E',
        dashArray,
        rotation: currentAngle
      };
      
      currentAngle += angle;
      return segment;
    });
  };

  const segments = createDonutSegments();

  return (
    <div className="exit-poll-container">
      <h2>Exit Poll Results</h2>
      {error && <div className="error" style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
      
      <div className="donut-chart-wrapper">
        <svg viewBox="0 0 200 200" className="donut-chart">
          {segments.map((segment) => (
            <circle
              key={segment.party}
              cx="100"
              cy="100"
              r="80"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="40"
              strokeDasharray={segment.dashArray}
              strokeDashoffset="0"
              transform={`rotate(${segment.rotation} 100 100)`}
              className="donut-segment"
            />
          ))}
          <text x="100" y="95" textAnchor="middle" className="donut-total-label">
            Total Votes
          </text>
          <text x="100" y="115" textAnchor="middle" className="donut-total-count">
            {total}
          </text>
        </svg>
        
        <div className="donut-legend">
          {segments.map((segment) => (
            <div key={segment.party} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="legend-details">
                <span className="legend-party">{segment.party}</span>
                <span className="legend-count">{segment.count} ({segment.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
