import React, { useEffect, useState } from 'react';
import { 
  getTerritories, 
  createTerritory, 
  updateTerritory, 
  deleteTerritory,
  getVolunteers,
  getVoters,
  assignVotersToTerritory
} from '../api';

export default function Territories({ token, role }: { token: string, role: string | null }) {
  const [territories, setTerritories] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAssignVoters, setShowAssignVoters] = useState<number | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<number[]>([]);
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    area_type: 'custom',
    assigned_to: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  const canManage = role === 'admin' || role === 'manager';

  const fetchData = async () => {
    try {
      const [territoriesData, votersData] = await Promise.all([
        getTerritories(token),
        getVoters(token)
      ]);
      const safeTerritories = Array.isArray(territoriesData) ? territoriesData : [];
      const safeVoters = Array.isArray(votersData) ? votersData : [];
      if (!Array.isArray(territoriesData) || !Array.isArray(votersData)) {
        setError((territoriesData as any)?.error || (votersData as any)?.error || 'Failed to load territories data.');
      } else {
        setError('');
      }
      setTerritories(safeTerritories);
      setVoters(safeVoters);

      if (canManage) {
        const volunteersData = await getVolunteers(token);
        setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
      }
    } catch (err) {
      setError('Failed to load territories data.');
      setTerritories([]);
      setVoters([]);
      setVolunteers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateTerritory(editId, form, token);
    } else {
      await createTerritory(form, token);
    }
    setForm({ name: '', description: '', area_type: 'custom', assigned_to: '' });
    setEditId(null);
    setShowForm(false);
    fetchData();
  };

  const handleEdit = (territory: any) => {
    setForm({
      name: territory.name,
      description: territory.description || '',
      area_type: territory.area_type,
      assigned_to: territory.assigned_to || ''
    });
    setEditId(territory.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this territory? This will unassign all voters.')) {
      await deleteTerritory(id, token);
      fetchData();
    }
  };

  const handleAssignVoters = async (territoryId: number) => {
    await assignVotersToTerritory(territoryId, selectedVoters, token);
    setShowAssignVoters(null);
    setSelectedVoters([]);
    fetchData();
  };

  const toggleVoterSelection = (voterId: number) => {
    if (selectedVoters.includes(voterId)) {
      setSelectedVoters(selectedVoters.filter(id => id !== voterId));
    } else {
      setSelectedVoters([...selectedVoters, voterId]);
    }
  };

  const getUnassignedVoters = () => {
    return voters.filter(v => !v.territory_id);
  };

  const getVotersByTerritory = (territoryId: number) => {
    return voters.filter(v => v.territory_id === territoryId);
  };

  return (
    <div className="voters-container">
      {error && <div className="error" style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Territories & Assignments</h2>
        {canManage && (
          <button 
            className="voter-btn" 
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', area_type: 'custom', assigned_to: '' }); }}
          >
            {showForm ? 'Cancel' : '+ New Territory'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form className="territory-form" onSubmit={handleSubmit}>
          <input
            className="voter-input"
            placeholder="Territory Name (e.g., Ward 5 - Main Street)"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            className="voter-input"
            placeholder="Description (e.g., Houses 1-50 on Main St)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <select
            className="voter-input"
            value={form.area_type}
            onChange={e => setForm({ ...form, area_type: e.target.value })}
          >
            <option value="neighborhood">Neighborhood</option>
            <option value="street">Street</option>
            <option value="ward">Ward</option>
            <option value="district">District</option>
            <option value="custom">Custom</option>
          </select>
          <select
            className="voter-input"
            value={form.assigned_to}
            onChange={e => setForm({ ...form, assigned_to: e.target.value })}
          >
            <option value="">Unassigned</option>
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.username}</option>
            ))}
          </select>
          <button className="voter-btn" type="submit">
            {editId ? 'Update' : 'Create'} Territory
          </button>
        </form>
      )}

      <div className="territories-grid">
        {territories.map(territory => {
          const territoryVoters = getVotersByTerritory(territory.id);
          const contactedCount = territoryVoters.filter(v => v.contact_status !== 'not_contacted').length;
          const completionRate = territoryVoters.length > 0 
            ? Math.round((contactedCount / territoryVoters.length) * 100) 
            : 0;

          return (
            <div key={territory.id} className="territory-card">
              <div className="territory-header">
                <div>
                  <h3>{territory.name}</h3>
                  <span className="territory-badge">{territory.area_type}</span>
                </div>
                {canManage && (
                  <div className="territory-actions">
                    <button className="icon-btn" onClick={() => handleEdit(territory)} title="Edit">✏️</button>
                    <button className="icon-btn" onClick={() => handleDelete(territory.id)} title="Delete">🗑️</button>
                  </div>
                )}
              </div>

              {territory.description && (
                <p className="territory-description">{territory.description}</p>
              )}

              <div className="territory-stats">
                <div className="stat-item">
                  <span className="stat-label">Assigned to:</span>
                  <span className="stat-value">{territory.assigned_username || 'Unassigned'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Voters:</span>
                  <span className="stat-value">{territoryVoters.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Contacted:</span>
                  <span className="stat-value">{contactedCount} ({completionRate}%)</span>
                </div>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
              </div>

              {canManage && (
                <button 
                  className="voter-btn" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => {
                    setShowAssignVoters(territory.id);
                    setSelectedVoters([]);
                  }}
                >
                  Assign Voters
                </button>
              )}
            </div>
          );
        })}

        {territories.length === 0 && (
          <div className="empty-state">
            <p>No territories created yet.</p>
            {canManage && <p>Create your first territory to start organizing your canvassing effort!</p>}
          </div>
        )}
      </div>

      {/* Assign Voters Modal */}
      {showAssignVoters && (
        <div className="modal-overlay" onClick={() => setShowAssignVoters(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Assign Voters to Territory</h3>
            <p className="modal-subtitle">
              Select voters to assign to this territory. Showing {getUnassignedVoters().length} unassigned voters.
            </p>
            
            <div className="voters-list">
              {getUnassignedVoters().map(voter => (
                <label key={voter.id} className="voter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedVoters.includes(voter.id)}
                    onChange={() => toggleVoterSelection(voter.id)}
                  />
                  <div className="voter-info">
                    <strong>{voter.name}</strong>
                    <span>{voter.address}</span>
                  </div>
                </label>
              ))}
              {getUnassignedVoters().length === 0 && (
                <p style={{ textAlign: 'center', color: '#999' }}>All voters are already assigned</p>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="voter-btn" 
                onClick={() => handleAssignVoters(showAssignVoters)}
                disabled={selectedVoters.length === 0}
              >
                Assign {selectedVoters.length} Voter{selectedVoters.length !== 1 ? 's' : ''}
              </button>
              <button 
                className="voter-btn cancel-btn" 
                onClick={() => setShowAssignVoters(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
