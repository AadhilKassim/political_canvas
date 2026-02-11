import React, { useEffect, useState, useMemo } from 'react';
import { getMyTerritories, getTerritoryDetails, updateVoterContact } from '../api';

export default function MyWalklist({ token }: { token: string }) {
  const [territories, setTerritories] = useState<any[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    contact_status: 'not_contacted',
    sentiment: '',
    issues: '',
    notes: ''
  });

  const fetchMyTerritories = async () => {
    const data = await getMyTerritories(token);
    setTerritories(data);
  };

  useEffect(() => {
    fetchMyTerritories();
  }, [token]);

  const loadTerritory = async (territoryId: number) => {
    const data = await getTerritoryDetails(territoryId, token);
    setSelectedTerritory(data.territory);
    setVoters(data.voters);
    setSelectedVoter(null);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoter) return;

    try {
      console.log('Submitting contact update:', { voterId: selectedVoter.id, contactForm });
      
      const result = await updateVoterContact(selectedVoter.id, contactForm, token);
      console.log('Contact update result:', result);
      
      // Close modal first
      setSelectedVoter(null);
      
      // Reset form
      setContactForm({
        contact_status: 'not_contacted',
        sentiment: '',
        issues: '',
        notes: ''
      });
      
      // Refresh territory data - this will update the voters list
      await loadTerritory(selectedTerritory.id);
      
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please check console for details.');
    }
  };

  const startContact = (voter: any) => {
    setSelectedVoter(voter);
    setContactForm({
      contact_status: voter.contact_status || 'contacted',
      sentiment: '',
      issues: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'not_contacted': '#95a5a6',
      'contacted': '#3498db',
      'supporter': '#27ae60',
      'undecided': '#f39c12',
      'opposed': '#e74c3c',
      'not_home': '#9b59b6',
      'do_not_contact': '#34495e'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'not_contacted': 'Not Contacted',
      'contacted': 'Contacted',
      'supporter': '✓ Supporter',
      'undecided': '? Undecided',
      'opposed': '✗ Opposed',
      'not_home': 'Not Home',
      'do_not_contact': 'Do Not Contact'
    };
    return labels[status] || status;
  };

  // Calculate derived state - must be before any conditional returns
  const notContactedVoters = useMemo(
    () => voters.filter(v => v.contact_status === 'not_contacted'),
    [voters]
  );
  
  const contactedVoters = useMemo(
    () => voters.filter(v => v.contact_status !== 'not_contacted'),
    [voters]
  );
  
  const completionRate = useMemo(
    () => voters.length > 0 ? Math.round((contactedVoters.length / voters.length) * 100) : 0,
    [voters, contactedVoters]
  );

  if (!selectedTerritory) {
    return (
      <div className="voters-container">
        <h2>My Walklists</h2>
        
        {territories.length === 0 ? (
          <div className="empty-state">
            <p>No territories assigned to you yet.</p>
            <p>Contact your campaign manager to get started!</p>
          </div>
        ) : (
          <div className="territories-grid">
            {territories.map(territory => {
              const completionRate = territory.total_voters > 0
                ? Math.round((territory.contacted_voters / territory.total_voters) * 100)
                : 0;

              return (
                <div key={territory.id} className="territory-card" onClick={() => loadTerritory(territory.id)}>
                  <h3>{territory.name}</h3>
                  {territory.description && <p className="territory-description">{territory.description}</p>}
                  
                  <div className="territory-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Voters:</span>
                      <span className="stat-value">{territory.total_voters}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Contacted:</span>
                      <span className="stat-value">{territory.contacted_voters}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Progress:</span>
                      <span className="stat-value">{completionRate}%</span>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
                  </div>

                  <button className="voter-btn" style={{ width: '100%', marginTop: '0.75rem' }}>
                    Start Canvassing →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="voters-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <button className="back-btn" onClick={() => setSelectedTerritory(null)}>← Back to My Territories</button>
          <h2 style={{ marginTop: '0.5rem' }}>{selectedTerritory.name}</h2>
          {selectedTerritory.description && <p style={{ color: '#999', margin: '0.25rem 0 0 0' }}>{selectedTerritory.description}</p>}
        </div>
      </div>

      <div className="walklist-summary">
        <div className="summary-card">
          <span className="summary-number">{voters.length}</span>
          <span className="summary-label">Total Voters</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{notContactedVoters.length}</span>
          <span className="summary-label">To Contact</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{contactedVoters.length}</span>
          <span className="summary-label">Contacted</span>
        </div>
        <div className="summary-card">
          <span className="summary-number">{completionRate}%</span>
          <span className="summary-label">Complete</span>
        </div>
      </div>

      <div className="voters-sections">
        {notContactedVoters.length > 0 && (
          <div className="voters-section">
            <h3>🎯 To Contact ({notContactedVoters.length})</h3>
            <div className="voter-cards">
              {notContactedVoters.map(voter => (
                <div key={voter.id} className="voter-card">
                  <div className="voter-card-header">
                    <h4>{voter.name}</h4>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(voter.contact_status) }}
                    >
                      {getStatusLabel(voter.contact_status)}
                    </span>
                  </div>
                  <div className="voter-card-details">
                    <p><strong>Address:</strong> {voter.address || 'N/A'}</p>
                    <p><strong>Age:</strong> {voter.age || 'N/A'} | <strong>Gender:</strong> {voter.gender || 'N/A'}</p>
                    <p><strong>Party:</strong> {voter.party || 'N/A'} | <strong>Leaning:</strong> {voter.leaning || 'N/A'}</p>
                  </div>
                  <button 
                    className="voter-btn" 
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    onClick={() => startContact(voter)}
                  >
                    Record Contact
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {contactedVoters.length > 0 && (
          <div className="voters-section">
            <h3>✅ Contacted ({contactedVoters.length})</h3>
            <div className="voter-cards">
              {contactedVoters.map(voter => (
                <div key={voter.id} className="voter-card contacted">
                  <div className="voter-card-header">
                    <h4>{voter.name}</h4>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(voter.contact_status) }}
                    >
                      {getStatusLabel(voter.contact_status)}
                    </span>
                  </div>
                  <div className="voter-card-details">
                    <p><strong>Address:</strong> {voter.address || 'N/A'}</p>
                    {voter.last_note && <p><strong>Last Note:</strong> {voter.last_note}</p>}
                    {voter.last_contact_date && (
                      <p><strong>Last Contact:</strong> {new Date(voter.last_contact_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <button 
                    className="voter-btn cancel-btn" 
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    onClick={() => startContact(voter)}
                  >
                    Update Status
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {selectedVoter && (
        <div className="modal-overlay" onClick={() => setSelectedVoter(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Contact: {selectedVoter.name}</h3>
            <p className="modal-subtitle">{selectedVoter.address}</p>

            <form onSubmit={handleContactSubmit}>
              <label className="form-label">Contact Status *</label>
              <select
                className="voter-input"
                value={contactForm.contact_status}
                onChange={e => setContactForm({ ...contactForm, contact_status: e.target.value })}
                required
              >
                <option value="contacted">Contacted</option>
                <option value="supporter">Supporter</option>
                <option value="undecided">Undecided</option>
                <option value="opposed">Opposed</option>
                <option value="not_home">Not Home</option>
                <option value="do_not_contact">Do Not Contact</option>
              </select>

              <label className="form-label">Sentiment</label>
              <select
                className="voter-input"
                value={contactForm.sentiment}
                onChange={e => setContactForm({ ...contactForm, sentiment: e.target.value })}
              >
                <option value="">Select sentiment...</option>
                <option value="very_positive">Very Positive</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="very_negative">Very Negative</option>
              </select>

              <label className="form-label">Key Issues</label>
              <input
                className="voter-input"
                placeholder="e.g., Healthcare, Education, Economy"
                value={contactForm.issues}
                onChange={e => setContactForm({ ...contactForm, issues: e.target.value })}
              />

              <label className="form-label">Notes</label>
              <textarea
                className="voter-input"
                placeholder="Add any additional notes about this contact..."
                value={contactForm.notes}
                onChange={e => setContactForm({ ...contactForm, notes: e.target.value })}
                rows={3}
              />

              <div className="modal-actions">
                <button className="voter-btn" type="submit">
                  Save Contact
                </button>
                <button 
                  className="voter-btn cancel-btn" 
                  type="button"
                  onClick={() => setSelectedVoter(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
