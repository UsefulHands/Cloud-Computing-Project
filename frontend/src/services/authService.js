import axios from 'axios';

const AUTH_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export function login(email, password) {
  return axios.post(`${AUTH_BASE}/auth/login`, { email, password }).then((r) => r.data);
}

export function register(fullName, email, password, university, department) {
  return axios
    .post(`${AUTH_BASE}/auth/register`, { fullName, email, password, university, department })
    .then((r) => r.data);
}

export function saveUser(user) {
  localStorage.setItem('studygroup_user', JSON.stringify(user));
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('studygroup_user')) || null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem('studygroup_user');
}
