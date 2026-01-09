import React, { useEffect, useState } from 'react';
import { getVoters, addVoter, updateVoter, deleteVoter } from '../api';

export default function Voters({ token, role }: { token: string, role: string | null }) {
  const [voters, setVoters] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);

  const fetchVoters = async () => {
    const data = await getVoters(token);
    setVoters(data);
  };

  useEffect(() => {
    fetchVoters();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateVoter(editId, form, token);
    } else {
      await addVoter(form, token);
    }
    setForm({});
    setEditId(null);
    fetchVoters();
  };

  const handleEdit = (voter: any) => {
    setForm(voter);
    setEditId(voter.id);
  };

  const handleDelete = async (id: number) => {
    await deleteVoter(id, token);
    fetchVoters();
  };

  // Only admin/manager can add/edit, only admin can delete
  const canAddEdit = role === 'admin' || role === 'manager';
  const canDelete = role === 'admin';

  return (
    <div className="voters-container">
      <h2>Voters</h2>
      {canAddEdit && (
        <form className="voter-form" onSubmit={handleSubmit}>
          <input className="voter-input" placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="voter-input" placeholder="Address" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
          <input className="voter-input" type="number" placeholder="Age" min="0" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} />
          <select
            className="voter-input"
            value={form.gender || ''}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
            <option value="Other">Other</option>
          </select>
          <select
            className="voter-input"
            value={form.party || ''}
            onChange={e => setForm({ ...form, party: e.target.value })}
            required
          >
            <option value="" disabled>Select Party</option>
            <option value="UDF">UDF</option>
            <option value="LDF">LDF</option>
            <option value="BJP">BJP</option>
            <option value="Others">Others</option>
          </select>
          <input className="voter-input" placeholder="Leaning" value={form.leaning || ''} onChange={e => setForm({ ...form, leaning: e.target.value })} />
          <label className="voter-consent-label">
            Consent:
            <input type="checkbox" checked={form.consent || false} onChange={e => setForm({ ...form, consent: e.target.checked })} />
          </label>
          <button className="voter-btn" type="submit">{editId ? 'Update' : 'Add'} Voter</button>
          {editId && <button className="voter-btn cancel-btn" type="button" onClick={() => { setEditId(null); setForm({}); }}>Cancel</button>}
        </form>
      )}
      <div className="voters-table-wrapper">
        <table className="voters-table">
          <thead>
            <tr>
              <th>Name</th><th>Address</th><th>Age</th><th>Gender</th><th>Party</th><th>Leaning</th><th>Consent</th>{(canAddEdit || canDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {voters.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.address}</td>
                <td>{v.age}</td>
                <td>{v.gender}</td>
                <td>{v.party}</td>
                <td>{v.leaning}</td>
                <td>{v.consent ? 'Yes' : 'No'}</td>
                {(canAddEdit || canDelete) && (
                  <td>
                    {canAddEdit && <button className="voter-btn" onClick={() => handleEdit(v)}>Edit</button>}
                    {canDelete && <button className="voter-btn delete-btn" onClick={() => handleDelete(v.id)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
