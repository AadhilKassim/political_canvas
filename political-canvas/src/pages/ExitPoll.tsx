import React, { useEffect, useState } from 'react';
import { getVoters } from '../api';

export default function ExitPoll({ token }: { token: string }) {
  const [poll, setPoll] = useState<{ [party: string]: number }>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const voters = await getVoters(token);
      const counts: { [party: string]: number } = { UDF: 0, LDF: 0, BJP: 0, Others: 0 };
      let totalCount = 0;
      voters.forEach((v: any) => {
        if (counts.hasOwnProperty(v.party)) {
          counts[v.party]++;
        } else {
          counts['Others']++;
        }
        totalCount++;
      });
      setPoll(counts);
      setTotal(totalCount);
    };
    fetchData();
  }, [token]);

  return (
    <div className="exit-poll-container">
      <h2>Exit Poll Results</h2>
      <table className="exit-poll-table">
        <thead>
          <tr>
            <th>Party</th>
            <th>Votes</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(poll).map(([party, count]) => (
            <tr key={party}>
              <td>{party}</td>
              <td>{count}</td>
              <td>{total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total Votes: {total}</p>
    </div>
  );
}
