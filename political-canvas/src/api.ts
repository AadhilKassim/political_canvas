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

// Add similar functions for logs, walklists, territories, and sync as needed
