// API service for backend requests
const API_URL = 'http://localhost:4000/api';

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function register(username: string, password: string, role: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  return res.json();
}

export async function getVoters(token: string) {
  const res = await fetch(`${API_URL}/voters`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function addVoter(voter: any, token: string) {
  const res = await fetch(`${API_URL}/voters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(voter)
  });
  return res.json();
}

export async function updateVoter(id: number, voter: any, token: string) {
  const res = await fetch(`${API_URL}/voters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(voter)
  });
  return res.json();
}

export async function deleteVoter(id: number, token: string) {
  const res = await fetch(`${API_URL}/voters/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Territories API
export async function getTerritories(token: string) {
  const res = await fetch(`${API_URL}/territories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getMyTerritories(token: string) {
  const res = await fetch(`${API_URL}/territories/my`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getTerritoryDetails(id: number, token: string) {
  const res = await fetch(`${API_URL}/territories/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createTerritory(territory: any, token: string) {
  const res = await fetch(`${API_URL}/territories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(territory)
  });
  return res.json();
}

export async function updateTerritory(id: number, territory: any, token: string) {
  const res = await fetch(`${API_URL}/territories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(territory)
  });
  return res.json();
}

export async function deleteTerritory(id: number, token: string) {
  const res = await fetch(`${API_URL}/territories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function assignVotersToTerritory(territoryId: number, voterIds: number[], token: string) {
  const res = await fetch(`${API_URL}/territories/${territoryId}/assign-voters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ voter_ids: voterIds })
  });
  return res.json();
}

// Walklists API
export async function getWalklists(token: string) {
  const res = await fetch(`${API_URL}/walklists`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getMyWalklists(token: string) {
  const res = await fetch(`${API_URL}/walklists/my`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createWalklist(walklist: any, token: string) {
  const res = await fetch(`${API_URL}/walklists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(walklist)
  });
  return res.json();
}

export async function updateWalklistStatus(id: number, status: string, token: string) {
  const res = await fetch(`${API_URL}/walklists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function updateVoterContact(voterId: number, data: any, token: string) {
  const res = await fetch(`${API_URL}/voters/${voterId}/contact`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update voter contact');
  }
  
  return res.json();
}

export async function getVolunteers(token: string) {
  const res = await fetch(`${API_URL}/users/volunteers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Add similar functions for logs, walklists, territories, and sync as needed
