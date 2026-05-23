import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3500,
});

client.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('studygroup_user'));
    if (user?.accessToken) {
      config.headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
  } catch {}
  return config;
});

export const apiBaseUrl = API_BASE_URL;

export const api = {
  listGroups: (params = {}) => client.get('/groups', { params }).then((response) => response.data),
  createGroup: (payload) => client.post('/groups', payload).then((response) => response.data),
  joinGroup: (groupId) => client.post(`/groups/${groupId}/join`).then((response) => response.data),
  listMembers: (groupId) => client.get(`/groups/${groupId}/members`).then((response) => response.data),

  listSessions: (groupId) => client.get(`/groups/${groupId}/sessions`).then((response) => response.data),
  createSession: (groupId, payload) => client.post(`/groups/${groupId}/sessions`, payload).then((response) => response.data),
  joinSession: (groupId, sessionId) =>
    client.post(`/groups/${groupId}/sessions/${sessionId}/attendees`).then((response) => response.data),

  listMessages: (groupId) => client.get(`/groups/${groupId}/messages`).then((response) => response.data),
  sendMessage: (groupId, payload) => client.post(`/groups/${groupId}/messages`, payload).then((response) => response.data),

  listNotes: (groupId) => client.get(`/groups/${groupId}/workspace/notes`).then((response) => response.data),
  createNote: (groupId, payload) => client.post(`/groups/${groupId}/workspace/notes`, payload).then((response) => response.data),

  listTasks: (groupId) => client.get(`/groups/${groupId}/workspace/tasks`).then((response) => response.data),
  createTask: (groupId, payload) => client.post(`/groups/${groupId}/workspace/tasks`, payload).then((response) => response.data),
  updateTask: (groupId, taskId, payload) =>
    client.put(`/groups/${groupId}/workspace/tasks/${taskId}`, payload).then((response) => response.data),

  listMaterials: (groupId) => client.get(`/groups/${groupId}/materials`).then((response) => response.data),
  createMaterial: (groupId, payload) => client.post(`/groups/${groupId}/materials`, payload).then((response) => response.data),

  listPomodoros: (groupId) => client.get(`/groups/${groupId}/pomodoros`).then((response) => response.data),
  startPomodoro: (groupId, payload) => client.post(`/groups/${groupId}/pomodoros`, payload).then((response) => response.data),
  updatePomodoroStatus: (groupId, pomodoroId, payload) =>
    client.patch(`/groups/${groupId}/pomodoros/${pomodoroId}/status`, payload).then((response) => response.data),

  listPendingRequests: (groupId) => client.get(`/groups/${groupId}/pending`).then((response) => response.data),
  approveJoinRequest: (groupId, userId) =>
    client.post(`/groups/${groupId}/members/${userId}/approve`).then((response) => response.data),
  rejectJoinRequest: (groupId, userId) =>
    client.delete(`/groups/${groupId}/members/${userId}/reject`).then((response) => response.data),
};
