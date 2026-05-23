import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { api, apiBaseUrl } from './services/apiClient';
import { getStoredUser, saveUser, clearUser } from './services/authService';
import AuthPage from './pages/AuthPage';
import {
  demoGroups,
  demoMaterials,
  demoMembers,
  demoMessages,
  demoNotes,
  demoPomodoros,
  demoTasks,
} from './data/demoData';

const views = [
  ['overview', 'Overview', 'grid'],
  ['groups', 'Groups', 'users'],
  ['workspace', 'Workspace', 'board'],
  ['materials', 'Materials', 'file'],
  ['chat', 'Chat', 'chat'],
  ['focus', 'Focus', 'timer'],
];

const emptyDetails = {
  members: [],
  tasks: [],
  notes: [],
  materials: [],
  messages: [],
  pomodoros: [],
};

const newGroupInitial = {
  name: '',
  description: '',
  courseCode: '',
  subject: '',
  visibility: 'PUBLIC',
  maxMembers: 10,
  tags: '',
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [activeView, setActiveView] = useState('overview');
  const [apiState, setApiState] = useState('checking');
  const [statusText, setStatusText] = useState('Checking backend…');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [details, setDetails] = useState(emptyDetails);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [groupForm, setGroupForm] = useState(newGroupInitial);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueAt: inputDate(1440) });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', type: 'LINK', url: '' });
  const [messageText, setMessageText] = useState('');
  const [focusForm, setFocusForm] = useState({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cycleCount: 4 });
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [toast, setToast] = useState(null);

  function handleAuth(user) {
    saveUser(user);
    setCurrentUser(user);
  }

  function handleLogout() {
    clearUser();
    setCurrentUser(null);
  }

  function showToast(message, type = 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let isActive = true;

    async function loadGroups() {
      try {
        const result = await api.listGroups();
        if (!isActive) return;
        const remoteGroups = Array.isArray(result) ? result : [];
        setGroups(remoteGroups);
        const firstJoined = remoteGroups.find((g) => g.myMembershipStatus === 'APPROVED');
        setSelectedGroupId(firstJoined?.id ?? null);
        setApiState('online');
        setStatusText(remoteGroups.length ? 'Backend connected' : 'Connected — no groups yet');
      } catch {
        if (!isActive) return;
        setGroups(demoGroups);
        setSelectedGroupId(demoGroups[0].id);
        setDetails(demoDetails(demoGroups[0].id));
        setApiState('demo');
        setStatusText('Demo mode active');
      }
    }

    loadGroups();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!selectedGroupId) { setDetails(emptyDetails); return; }
    if (apiState !== 'online') { setDetails(demoDetails(selectedGroupId)); return; }

    let isActive = true;

    async function loadDetails() {
      const fallback = demoDetails(selectedGroupId);
      const results = await Promise.allSettled([
        api.listMembers(selectedGroupId),
        api.listTasks(selectedGroupId),
        api.listNotes(selectedGroupId),
        api.listMaterials(selectedGroupId),
        api.listMessages(selectedGroupId),
        api.listPomodoros(selectedGroupId),
      ]);

      if (!isActive) return;
      setDetails({
        members: getArray(results[0], fallback.members),
        tasks: getArray(results[1], fallback.tasks),
        notes: getArray(results[2], fallback.notes),
        materials: getArray(results[3], fallback.materials),
        messages: getArray(results[4], fallback.messages),
        pomodoros: getArray(results[5], fallback.pomodoros),
      });
    }

    loadDetails();
    return () => { isActive = false; };
  }, [apiState, selectedGroupId]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
  const isMember = selectedGroup?.myMembershipStatus === 'APPROVED';
  const isPending = selectedGroup?.myMembershipStatus === 'PENDING';
  const isOwner = !!currentUser && selectedGroup?.ownerId === currentUser.userId;
  const myGroups = groups.filter((g) => g.myMembershipStatus === 'APPROVED');

  useEffect(() => {
    if (!selectedGroupId || !isOwner || apiState !== 'online') { setPendingRequests([]); return; }
    api.listPendingRequests(selectedGroupId)
      .then(setPendingRequests)
      .catch(() => setPendingRequests([]));
  }, [selectedGroupId, isOwner, apiState]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) { setTimerRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);
  const subjects = useMemo(() => ['All', ...Array.from(new Set(groups.map((g) => g.subject).filter(Boolean)))], [groups]);
  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim();
    return groups.filter((g) => {
      const text = `${g.name} ${g.description} ${g.courseCode} ${g.subject} ${(g.tags || []).join(' ')}`.toLowerCase();
      return (subject === 'All' || g.subject === subject) && text.includes(q);
    });
  }, [groups, search, subject]);

  const completedTasks = details.tasks.filter((t) => t.status === 'DONE').length;
  const taskProgress = details.tasks.length ? Math.round((completedTasks / details.tasks.length) * 100) : 0;
  const activePomodoro = details.pomodoros.find((p) => p.status === 'RUNNING') || null;

  function addDetail(type, item) {
    setDetails((cur) => ({ ...cur, [type]: [item, ...cur[type]] }));
  }

  async function handleJoinGroup(groupId) {
    if (apiState !== 'online') { showToast('Backend connection required.', 'error'); return; }
    const targetGroup = groups.find((g) => g.id === groupId);
    const isPublic = targetGroup?.visibility === 'PUBLIC';
    try {
      await api.joinGroup(groupId);
      const result = await api.listGroups();
      const updated = Array.isArray(result) ? result : [];
      setGroups(updated);
      if (isPublic) {
        setSelectedGroupId(groupId);
        setActiveView('overview');
        showToast('You have joined the group!', 'success');
      } else {
        showToast('Join request sent! Waiting for admin approval.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Could not process join request.', 'error');
    }
  }

  async function handleApproveRequest(userId) {
    if (!selectedGroupId) return;
    try {
      await api.approveJoinRequest(selectedGroupId, userId);
      setPendingRequests((cur) => cur.filter((r) => r.userId !== userId));
      const result = await api.listGroups();
      setGroups(Array.isArray(result) ? result : []);
      showToast('Membership approved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Approval failed.', 'error');
    }
  }

  async function handleRejectRequest(userId) {
    if (!selectedGroupId) return;
    try {
      await api.rejectJoinRequest(selectedGroupId, userId);
      setPendingRequests((cur) => cur.filter((r) => r.userId !== userId));
      showToast('Request rejected.', 'info');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Rejection failed.', 'error');
    }
  }

  async function createGroup(event) {
    event.preventDefault();
    const payload = {
      ...groupForm,
      maxMembers: Number(groupForm.maxMembers),
      tags: groupForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      const created = apiState === 'online'
        ? await api.createGroup(payload)
        : { ...payload, id: Date.now(), memberCount: 1, ownerId: 1, createdAt: new Date().toISOString() };
      setGroups((cur) => [created, ...cur]);
      setSelectedGroupId(created.id);
      setGroupForm(newGroupInitial);
      setActiveView('overview');
      showToast('Group created successfully!', 'success');
    } catch {
      showToast('Could not create group.', 'error');
    }
  }

  async function createTask(event) {
    event.preventDefault();
    if (!selectedGroup) return;
    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: null,
      dueAt: new Date(taskForm.dueAt).toISOString(),
    };
    try {
      const created = apiState === 'online'
        ? await api.createTask(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, status: 'TODO', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      addDetail('tasks', created);
      setTaskForm({ title: '', description: '', dueAt: inputDate(1440) });
      showToast('Task added!', 'success');
    } catch {
      showToast('Could not add task.', 'error');
    }
  }

  async function createNote(event) {
    event.preventDefault();
    if (!selectedGroup) return;
    try {
      const created = apiState === 'online'
        ? await api.createNote(selectedGroup.id, noteForm)
        : { ...noteForm, id: Date.now(), groupId: selectedGroup.id, updatedBy: 1, updatedAt: new Date().toISOString() };
      addDetail('notes', created);
      setNoteForm({ title: '', content: '' });
      showToast('Note saved!', 'success');
    } catch {
      showToast('Could not save note.', 'error');
    }
  }

  async function createMaterial(event) {
    event.preventDefault();
    if (!selectedGroup) return;
    try {
      const created = apiState === 'online'
        ? await api.createMaterial(selectedGroup.id, materialForm)
        : { ...materialForm, id: Date.now(), groupId: selectedGroup.id, uploadedBy: 1, uploadedAt: new Date().toISOString() };
      addDetail('materials', created);
      setMaterialForm({ title: '', description: '', type: 'LINK', url: '' });
      showToast('Material added!', 'success');
    } catch {
      showToast('Could not add material.', 'error');
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedGroup || !messageText.trim()) return;
    const payload = { content: messageText.trim(), type: 'TEXT', materialId: null };
    try {
      const created = apiState === 'online'
        ? await api.sendMessage(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, senderId: currentUser.userId, senderName: currentUser.fullName, sentAt: new Date().toISOString(), editedAt: null };
      addDetail('messages', created);
      setMessageText('');
    } catch {
      showToast('Could not send message.', 'error');
    }
  }

  async function startPomodoro(event) {
    event.preventDefault();
    if (!selectedGroup) return;
    const payload = {
      focusMinutes: Number(focusForm.focusMinutes),
      shortBreakMinutes: Number(focusForm.shortBreakMinutes),
      longBreakMinutes: Number(focusForm.longBreakMinutes),
      cycleCount: Number(focusForm.cycleCount),
      taskId: details.tasks.find((t) => t.status !== 'DONE')?.id || null,
    };
    try {
      const created = apiState === 'online'
        ? await api.startPomodoro(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, userId: 1, completedCycles: 0, status: 'RUNNING', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setDetails((cur) => ({ ...cur, pomodoros: [created, ...cur.pomodoros] }));
      setTimerSeconds(payload.focusMinutes * 60);
      setTimerRunning(true);
      showToast('Focus timer started!', 'success');
    } catch {
      showToast('Could not start timer.', 'error');
    }
  }

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="app-shell">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <Icon name="book" />
          </div>
          <div>
            <strong>StudyGroup</strong>
            <small>Collaborative workspace</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Application sections">
          {views.map(([id, label, icon]) => (
            <button
              className={`nav-button ${activeView === id ? 'active' : ''}`}
              key={id}
              onClick={() => setActiveView(id)}
              type="button"
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`api-card ${apiState}`}>
          <span className="status-dot" />
          <div>
            <strong>{apiState === 'online' ? 'Backend online' : apiState === 'demo' ? 'Demo mode' : 'Connecting…'}</strong>
            <small>{apiBaseUrl}</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <p className="eyebrow">Study Group Platform</p>
            <h1>{selectedGroup?.name || 'Welcome'}</h1>
          </div>
          <div className="topbar-right">
            <div className={`status-pill ${apiState}`}>
              <span className="status-dot-sm" />
              <span>{statusText}</span>
            </div>
            <div className="group-selector-wrapper">
              <Icon name="users" />
              <select
                className="group-selector"
                value={selectedGroupId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value) || null;
                  setSelectedGroupId(id);
                  setActiveView('overview');
                }}
              >
                <option value="">Select group…</option>
                {myGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {isOwner && pendingRequests.length > 0 && (
              <div className="pending-badge" title="Pending join requests">
                <Icon name="users" />
                <span>{pendingRequests.length} pending</span>
              </div>
            )}
            <div className="user-info">
              <span className="user-name">{currentUser.fullName}</span>
              <button className="logout-button" type="button" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="layout">
          <section className="content">
            {activeView === 'overview' && (
              <Overview
                selectedGroup={selectedGroup}
                groups={groups}
                details={details}
                taskProgress={taskProgress}
                activePomodoro={activePomodoro}
                setActiveView={setActiveView}
                isOwner={isOwner}
                isMember={isMember}
                pendingRequests={pendingRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                onJoin={() => handleJoinGroup(selectedGroupId)}
                isPending={isPending}
                visibility={selectedGroup?.visibility}
              />
            )}
            {activeView === 'groups' && (
              <Groups
                groups={filteredGroups}
                selectedGroupId={selectedGroupId}
                currentUserId={currentUser?.userId}
                selectGroup={(id) => { setSelectedGroupId(id); setActiveView('overview'); }}
                onJoin={handleJoinGroup}
                search={search}
                setSearch={setSearch}
                subjects={subjects}
                subject={subject}
                setSubject={setSubject}
                form={groupForm}
                setForm={setGroupForm}
                submit={createGroup}
              />
            )}
            {activeView === 'workspace' && (
              isMember
                ? <Workspace
                    tasks={details.tasks}
                    notes={details.notes}
                    taskForm={taskForm}
                    setTaskForm={setTaskForm}
                    noteForm={noteForm}
                    setNoteForm={setNoteForm}
                    createTask={createTask}
                    createNote={createNote}
                  />
                : <MembershipGate isPending={isPending} onJoin={() => handleJoinGroup(selectedGroupId)} visibility={selectedGroup?.visibility} />
            )}
            {activeView === 'materials' && (
              isMember
                ? <Materials
                    materials={details.materials}
                    form={materialForm}
                    setForm={setMaterialForm}
                    submit={createMaterial}
                  />
                : <MembershipGate isPending={isPending} onJoin={() => handleJoinGroup(selectedGroupId)} visibility={selectedGroup?.visibility} />
            )}
            {activeView === 'chat' && (
              isMember
                ? <Chat
                    messages={details.messages}
                    currentUser={currentUser}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    submit={sendMessage}
                  />
                : <MembershipGate isPending={isPending} onJoin={() => handleJoinGroup(selectedGroupId)} visibility={selectedGroup?.visibility} />
            )}
            {activeView === 'focus' && (
              isMember
                ? <Focus
                    activePomodoro={activePomodoro}
                    form={focusForm}
                    setForm={setFocusForm}
                    submit={startPomodoro}
                    timerSeconds={timerSeconds}
                    timerRunning={timerRunning}
                    setTimerRunning={setTimerRunning}
                    reset={() => { setTimerRunning(false); setTimerSeconds(Number(focusForm.focusMinutes) * 60); }}
                  />
                : <MembershipGate isPending={isPending} onJoin={() => handleJoinGroup(selectedGroupId)} visibility={selectedGroup?.visibility} />
            )}
          </section>

          <aside className="rail">
            <GroupProfile selectedGroup={selectedGroup} members={details.members} progress={taskProgress} />
            <WorkspaceSummary tasks={details.tasks} notes={details.notes} setActiveView={setActiveView} />
            <MiniFocus activePomodoro={activePomodoro} seconds={timerSeconds} timerRunning={timerRunning} setActiveView={setActiveView} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function MembershipGate({ isPending, onJoin, visibility }) {
  const isPublic = visibility === 'PUBLIC';
  if (isPending) {
    return (
      <div className="membership-gate">
        <div className="gate-icon"><Icon name="clock" /></div>
        <h2>Your Request is Under Review</h2>
        <p>The group admin has not approved your join request yet. You can access the content once approved.</p>
      </div>
    );
  }
  return (
    <div className="membership-gate">
      <div className="gate-icon"><Icon name="shield" /></div>
      <h2>You Are Not a Member of This Group</h2>
      <p>{isPublic ? 'Click below to join this public group instantly.' : 'Send a join request to the group admin to access this content.'}</p>
      <button className="primary-button" type="button" onClick={onJoin}>
        <Icon name="users" /> {isPublic ? 'Join Group' : 'Request to Join'}
      </button>
    </div>
  );
}

function Overview({ selectedGroup, groups, details, taskProgress, activePomodoro, setActiveView,
  isOwner, isMember, pendingRequests, onApprove, onReject, onJoin, isPending, visibility }) {
  const metrics = [
    { label: 'Groups', value: groups.length, detail: 'Available groups', icon: 'users', color: 'blue' },
    { label: 'Members', value: selectedGroup?.memberCount || details.members.length, detail: 'In this group', icon: 'shield', color: 'green' },
    { label: 'Tasks', value: details.tasks.length, detail: `${details.tasks.filter(t => t.status === 'DONE').length} completed`, icon: 'check', color: 'teal' },
    { label: 'Progress', value: `${taskProgress}%`, detail: 'Work done', icon: 'board', color: 'purple' },
  ];

  if (!selectedGroup) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Icon name="users" /></div>
        <h2>No group selected</h2>
        <p>Join or create a study group to get started.</p>
        <button className="primary-button" onClick={() => setActiveView('groups')} type="button">
          <Icon name="users" /> Browse Groups
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      {isOwner && pendingRequests.length > 0 && (
        <section className="panel pending-panel">
          <PanelTitle title={`Pending Join Requests (${pendingRequests.length})`} />
          <div className="pending-list">
            {pendingRequests.map((req) => (
              <div key={req.userId} className="pending-row">
                <div className="pending-info">
                  <strong>{req.fullName}</strong>
                  <span>{req.email}</span>
                  <span className="pending-time">{relative(req.requestedAt)}</span>
                </div>
                <div className="pending-actions">
                  <button className="approve-button" type="button" onClick={() => onApprove(req.userId)}>
                    Approve
                  </button>
                  <button className="reject-button" type="button" onClick={() => onReject(req.userId)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isMember && !isOwner && (
        <div className="membership-gate inline-gate">
          <div>
            <h3>{isPending ? 'Your Join Request is Pending' : 'You Are Not a Member of This Group'}</h3>
            <p>
              {isPending
                ? 'Wait for the admin to approve your request.'
                : visibility === 'PUBLIC'
                  ? 'This is a public group. Click to join instantly.'
                  : 'Send a join request to the admin to access this content.'}
            </p>
          </div>
          {!isPending && (
            <button className="primary-button" type="button" onClick={onJoin}>
              <Icon name="users" /> {visibility === 'PUBLIC' ? 'Join Group' : 'Request to Join'}
            </button>
          )}
        </div>
      )}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">{selectedGroup.courseCode}</p>
          <h2>{selectedGroup.subject || selectedGroup.name}</h2>
          <p>{selectedGroup.description}</p>
          <div className="chip-row">
            {(selectedGroup.tags || []).map((tag) => <span className="chip" key={tag}>{tag}</span>)}
            <span className={`chip visibility-chip ${selectedGroup.visibility?.toLowerCase()}`}>{selectedGroup.visibility}</span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => setActiveView('workspace')} type="button">
            <Icon name="board" /> Open Workspace
          </button>
          <button className="secondary-button" onClick={() => setActiveView('chat')} type="button">
            <Icon name="chat" /> Group Chat
          </button>
        </div>
      </section>

      <div className="metrics-grid">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="two-column">
        <section className="panel">
          <PanelTitle title="Recent Tasks" action="Manage" onAction={() => setActiveView('workspace')} />
          <div className="list">
            {details.tasks.length
              ? details.tasks.slice(0, 4).map((task) => <TaskCard key={task.id} task={task} />)
              : <EmptyText text="No tasks yet. Add some in the Workspace." />}
          </div>
        </section>
        <section className="panel">
          <PanelTitle title="Workspace Summary" action="Open" onAction={() => setActiveView('workspace')} />
          <div className="summary-grid">
            <div className="summary-item">
              <strong>{details.tasks.filter(t => t.status === 'TODO').length}</strong>
              <span>To Do</span>
            </div>
            <div className="summary-item in-progress">
              <strong>{details.tasks.filter(t => t.status === 'IN_PROGRESS').length}</strong>
              <span>In Progress</span>
            </div>
            <div className="summary-item done">
              <strong>{details.tasks.filter(t => t.status === 'DONE').length}</strong>
              <span>Done</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} />
            </div>
            <span>{taskProgress}% complete</span>
          </div>
          <div className="summary-footer">
            <span><Icon name="file" /> {details.notes.length} notes</span>
            <span><Icon name="file" /> {details.materials.length} materials</span>
            <span><Icon name="chat" /> {details.messages.length} messages</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function Groups({ groups, selectedGroupId, currentUserId, selectGroup, onJoin, search, setSearch, subjects, subject, setSubject, form, setForm, submit }) {
  return (
    <div className="stack">
      <ViewTitle
        eyebrow="Group Discovery"
        title="Find or create a study group"
        description="Browse available groups, filter by subject, or start a new one."
      />
      <div className="toolbar">
        <label className="search-box">
          <Icon name="search" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, subject, or tag…" />
        </label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="groups-layout">
        <div className="group-grid">
          {groups.map((group) => (
            <button
              className={`group-card ${selectedGroupId === group.id ? 'selected' : ''}`}
              key={group.id}
              onClick={() => selectGroup(group.id)}
              type="button"
            >
              <div className="card-top">
                <span className="course">{group.courseCode}</span>
                <span className={`visibility ${group.visibility?.toLowerCase()}`}>{group.visibility}</span>
              </div>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className="chip-row">
                {(group.tags || []).slice(0, 3).map((tag) => <span className="chip" key={tag}>{tag}</span>)}
              </div>
              <div className="card-footer">
                <span><Icon name="users" /> {group.memberCount || 0}/{group.maxMembers || '∞'}</span>
                {group.myMembershipStatus === 'APPROVED'
                  ? <span className="membership-chip approved">Member</span>
                  : group.myMembershipStatus === 'PENDING'
                    ? <span className="membership-chip pending">Pending</span>
                    : group.ownerId === currentUserId
                      ? <span className="membership-chip owner">Admin</span>
                      : (
                        <button
                          className="join-btn"
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onJoin(group.id); }}
                        >
                          <Icon name="users" /> {group.visibility === 'PUBLIC' ? 'Join' : 'Request to Join'}
                        </button>
                      )
                }
              </div>
            </button>
          ))}
          {!groups.length && <EmptyText text="No groups match this filter." />}
        </div>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Create New Group" />
          <Field label="Group Name"><input required placeholder="e.g. Cloud Computing Study Group" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" placeholder="What will your group study?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Course Code"><input required placeholder="CS-301" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} /></Field>
            <Field label="Subject"><input required placeholder="Computer Science" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          </div>
          <div className="form-grid">
            <Field label="Max Members"><input min="2" type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: e.target.value })} /></Field>
            <Field label="Visibility">
              <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </Field>
          </div>
          <Field label="Tags"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="docker, aws, cloud (comma separated)" /></Field>
          <button className="primary-button full" type="submit"><Icon name="users" /> Create Group</button>
        </form>
      </div>
    </div>
  );
}

function Workspace({ tasks, notes, taskForm, setTaskForm, noteForm, setNoteForm, createTask, createNote }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Shared Workspace" title="Tasks and notes in one place" description="Manage your group's work with a Kanban board and shared notes." />
      <div className="kanban">
        {[
          { status: 'TODO', label: 'To Do', color: 'todo' },
          { status: 'IN_PROGRESS', label: 'In Progress', color: 'progress' },
          { status: 'DONE', label: 'Done', color: 'done' },
        ].map(({ status, label, color }) => (
          <section className={`task-column ${color}`} key={status}>
            <div className="column-title">
              <h3>{label}</h3>
              <span>{tasks.filter((t) => t.status === status).length}</span>
            </div>
            <div className="list">
              {tasks.filter((t) => t.status === status).map((task) => <TaskCard key={task.id} task={task} />)}
            </div>
          </section>
        ))}
      </div>
      <div className="two-column">
        <form className="form-card" onSubmit={createTask}>
          <PanelTitle title="Add Task" />
          <Field label="Task Title"><input required placeholder="What needs to be done?" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" placeholder="Describe the task…" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></Field>
          <Field label="Due Date"><input type="datetime-local" value={taskForm.dueAt} onChange={(e) => setTaskForm({ ...taskForm, dueAt: e.target.value })} /></Field>
          <button className="primary-button full" type="submit"><Icon name="check" /> Add Task</button>
        </form>
        <section className="panel">
          <PanelTitle title="Shared Notes" />
          <div className="note-grid">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <span>Updated {relative(note.updatedAt)}</span>
              </article>
            ))}
          </div>
          <form className="inline-form" onSubmit={createNote}>
            <input required placeholder="Note title" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
            <textarea required rows="3" placeholder="Note content…" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
            <button className="secondary-button" type="submit">Save Note</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Materials({ materials, form, setForm, submit }) {
  const typeIcons = { LINK: '🔗', PDF: '📄', DOCUMENT: '📝', IMAGE: '🖼️', OTHER: '📁' };
  return (
    <div className="stack">
      <ViewTitle eyebrow="Study Materials" title="Share links and resources" description="Add links, documents, and other learning materials for your group." />
      <div className="two-column wide-left">
        <section className="panel">
          <PanelTitle title="Shared Materials" />
          <div className="list">
            {materials.length ? materials.map((material) => (
              <a className="material" href={material.url || '#'} key={material.id} rel="noreferrer" target="_blank">
                <span className="material-type-icon">{typeIcons[material.type] || '📁'}</span>
                <div>
                  <h3>{material.title}</h3>
                  <p>{material.description}</p>
                  <span>{material.type} · {relative(material.uploadedAt)}</span>
                </div>
                <Icon name="arrow" />
              </a>
            )) : <EmptyText text="No materials shared yet. Add the first one!" />}
          </div>
        </section>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Add Material" />
          <Field label="Title"><input required placeholder="Resource title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" placeholder="What is this resource about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="LINK">Link</option>
              <option value="PDF">PDF</option>
              <option value="DOCUMENT">Document</option>
              <option value="IMAGE">Image</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="URL"><input required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></Field>
          <button className="primary-button full" type="submit"><Icon name="file" /> Add Material</button>
        </form>
      </div>
    </div>
  );
}

function Chat({ messages, currentUser, messageText, setMessageText, submit }) {
  const sorted = [...messages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  return (
    <div className="stack">
      <ViewTitle eyebrow="Group Chat" title="Keep everyone in the loop" description="Send messages to your study group in real time." />
      <section className="chat-panel">
        <div className="messages">
          {sorted.length ? sorted.map((msg) => (
            <article className={`message ${msg.senderId === currentUser?.userId ? 'mine' : ''}`} key={msg.id}>
              <div className="message-meta">
                <strong>{msg.senderName}</strong>
                <span>{relative(msg.sentAt)}</span>
              </div>
              <p>{msg.content}</p>
            </article>
          )) : (
            <div className="chat-empty">
              <Icon name="chat" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>
        <form className="composer" onSubmit={submit}>
          <input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}
          />
          <button className="primary-button send-button" type="submit" disabled={!messageText.trim()}>
            <Icon name="arrow" />
          </button>
        </form>
      </section>
    </div>
  );
}

function Focus({ activePomodoro, form, setForm, submit, timerSeconds, timerRunning, setTimerRunning, reset }) {
  const progress = activePomodoro
    ? Math.round((activePomodoro.completedCycles / activePomodoro.cycleCount) * 100)
    : 0;

  return (
    <div className="stack">
      <ViewTitle eyebrow="Focus Timer" title="Study with Pomodoro cycles" description="Configure your focus and break intervals, then start a timed study session." />
      <div className="focus-grid">
        <section className="timer-panel">
          <div className="timer-status">
            <span className={`timer-badge ${timerRunning ? 'running' : 'ready'}`}>
              {timerRunning ? '● RUNNING' : activePomodoro ? '⏸ PAUSED' : '○ READY'}
            </span>
          </div>
          <strong className="timer-display">{timer(timerSeconds)}</strong>
          {activePomodoro && (
            <div className="cycle-progress">
              <div className="cycle-track">
                <div className="cycle-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>{activePomodoro.completedCycles}/{activePomodoro.cycleCount} cycles</span>
            </div>
          )}
          <div className="timer-controls">
            <button className="primary-button" type="button" onClick={() => setTimerRunning(!timerRunning)}>
              {timerRunning ? <><Icon name="clock" /> Pause</> : <><Icon name="play" /> Start</>}
            </button>
            <button className="secondary-button" type="button" onClick={reset}>
              Reset
            </button>
          </div>
        </section>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Cycle Settings" />
          <div className="form-grid">
            <Field label="Focus (min)"><input min="1" type="number" value={form.focusMinutes} onChange={(e) => setForm({ ...form, focusMinutes: e.target.value })} /></Field>
            <Field label="Short break (min)"><input min="1" type="number" value={form.shortBreakMinutes} onChange={(e) => setForm({ ...form, shortBreakMinutes: e.target.value })} /></Field>
          </div>
          <div className="form-grid">
            <Field label="Long break (min)"><input min="1" type="number" value={form.longBreakMinutes} onChange={(e) => setForm({ ...form, longBreakMinutes: e.target.value })} /></Field>
            <Field label="Cycles"><input min="1" type="number" value={form.cycleCount} onChange={(e) => setForm({ ...form, cycleCount: e.target.value })} /></Field>
          </div>
          <button className="primary-button full" type="submit"><Icon name="timer" /> Start Pomodoro</button>
        </form>
      </div>
    </div>
  );
}

function GroupProfile({ selectedGroup, members, progress }) {
  return (
    <section className="rail-card">
      <PanelTitle title="Group Profile" />
      {selectedGroup ? (
        <>
          <span className="course">{selectedGroup.courseCode}</span>
          <h3>{selectedGroup.subject || selectedGroup.name}</h3>
          <p>{selectedGroup.description}</p>
          <div className="rail-metric"><span>Members</span><strong>{selectedGroup.memberCount || members.length}/{selectedGroup.maxMembers || '∞'}</strong></div>
          <div className="rail-metric">
            <span>Task Progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-mini">
            <div className="progress-mini-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="avatars">
            {members.slice(0, 5).map((m) => (
              <span key={m.userId} title={m.fullName}>{initials(m.fullName)}</span>
            ))}
            {members.length > 5 && <span className="avatar-more">+{members.length - 5}</span>}
          </div>
        </>
      ) : <p className="no-group-text">Select a group to see its profile.</p>}
    </section>
  );
}

function WorkspaceSummary({ tasks, notes, setActiveView }) {
  const todo = tasks.filter(t => t.status === 'TODO').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  return (
    <section className="rail-card">
      <PanelTitle title="Quick Stats" action="Workspace" onAction={() => setActiveView('workspace')} />
      <div className="quick-stats">
        <div className="qs-item"><span>{todo}</span><small>To Do</small></div>
        <div className="qs-item in-progress"><span>{inProgress}</span><small>Active</small></div>
        <div className="qs-item done"><span>{done}</span><small>Done</small></div>
      </div>
      <div className="qs-footer">
        <span><Icon name="file" /> {notes.length} shared notes</span>
      </div>
    </section>
  );
}

function MiniFocus({ activePomodoro, seconds, timerRunning, setActiveView }) {
  return (
    <section className="rail-card focus-card">
      <PanelTitle title="Focus Timer" />
      <strong className="mini-time">{timer(seconds)}</strong>
      <p>{timerRunning ? 'Timer is running…' : activePomodoro ? `${activePomodoro.completedCycles}/${activePomodoro.cycleCount} cycles done` : 'Ready for a new cycle'}</p>
      <button className="secondary-button full" onClick={() => setActiveView('focus')} type="button">
        <Icon name="timer" /> Open Focus
      </button>
    </section>
  );
}

function MetricCard({ label, value, detail, icon, color }) {
  return (
    <article className={`metric-card metric-${color}`}>
      <span className="metric-icon"><Icon name={icon} /></span>
      <strong>{value}</strong>
      <h3>{label}</h3>
      <p>{detail}</p>
    </article>
  );
}

function TaskCard({ task }) {
  const statusClass = { TODO: 'todo', IN_PROGRESS: 'in-progress', DONE: 'done' }[task.status] || '';
  return (
    <article className={`task-card ${statusClass}`}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`task-badge ${statusClass}`}>{task.status.replace('_', ' ')}</span>
      </div>
      <p>{task.description}</p>
      <span className="task-due"><Icon name="clock" /> Due {shortDate(task.dueAt)}</span>
    </article>
  );
}

function PanelTitle({ title, action, onAction }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action && (
        <button onClick={onAction} type="button">
          {action} <Icon name="arrow" />
        </button>
      )}
    </div>
  );
}

function ViewTitle({ eyebrow, title, description }) {
  return (
    <section className="view-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function EmptyText({ text }) {
  return <p className="empty-text">{text}</p>;
}

function demoDetails(groupId) {
  return {
    members: demoMembers[groupId] || [],
    tasks: demoTasks[groupId] || [],
    notes: demoNotes[groupId] || [],
    materials: demoMaterials[groupId] || [],
    messages: demoMessages[groupId] || [],
    pomodoros: demoPomodoros[groupId] || [],
  };
}

function getArray(result, fallback) {
  return result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : fallback;
}

function inputDate(minutes) {
  const d = new Date(Date.now() + minutes * 60000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function shortDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function relative(value) {
  if (!value) return 'recently';
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function timer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function Icon({ name }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    board: 'M9 11H4a2 2 0 0 0-2 2v7h7v-9zM20 4h-7v16h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM9 4H4a2 2 0 0 0-2 2v3h7V4z',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2',
    chat: 'M21 15a4 4 0 0 1-4 4H7l-4 4v-4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z',
    timer: 'M10 2h4M12 14l3-3M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15zM4 4.5v15',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    pulse: 'M22 12h-4l-3 8-6-16-3 8H2',
    check: 'M20 6L9 17l-5-5',
    arrow: 'M9 18l6-6-6-6',
    search: 'M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16',
    play: 'M5 3l14 9-14 9V3z',
    clock: 'M12 8v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  };
  return (
    <svg aria-hidden="true" className="icon" fill="none" viewBox="0 0 24 24">
      <path d={paths[name] || paths.grid} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default App;
