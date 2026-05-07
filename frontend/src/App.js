import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { api, apiBaseUrl } from './services/apiClient';
import {
  demoGroups,
  demoMaterials,
  demoMembers,
  demoMessages,
  demoNotes,
  demoPomodoros,
  demoSessions,
  demoTasks,
} from './data/demoData';

const views = [
  ['overview', 'Overview', 'grid'],
  ['groups', 'Groups', 'users'],
  ['sessions', 'Sessions', 'video'],
  ['workspace', 'Workspace', 'board'],
  ['materials', 'Materials', 'file'],
  ['chat', 'Chat', 'chat'],
  ['focus', 'Focus', 'timer'],
];

const emptyDetails = {
  members: [],
  sessions: [],
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
  const [activeView, setActiveView] = useState('overview');
  const [apiState, setApiState] = useState('checking');
  const [statusText, setStatusText] = useState('Checking backend');
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [details, setDetails] = useState(emptyDetails);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [groupForm, setGroupForm] = useState(newGroupInitial);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    startsAt: inputDate(90),
    endsAt: inputDate(180),
    meetingUrl: '',
    capacity: 10,
  });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueAt: inputDate(1440) });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', type: 'LINK', url: '' });
  const [messageText, setMessageText] = useState('');
  const [focusForm, setFocusForm] = useState({ focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cycleCount: 4 });
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadGroups() {
      try {
        const result = await api.listGroups();
        if (!isActive) return;
        const remoteGroups = Array.isArray(result) ? result : [];
        setGroups(remoteGroups);
        setSelectedGroupId(remoteGroups[0]?.id ?? null);
        setApiState('online');
        setStatusText(remoteGroups.length ? 'Backend connected' : 'Backend connected, no groups yet');
      } catch (error) {
        if (!isActive) return;
        setGroups(demoGroups);
        setSelectedGroupId(demoGroups[0].id);
        setDetails(demoDetails(demoGroups[0].id));
        setApiState('demo');
        setStatusText('Backend offline, demo data active');
      }
    }

    loadGroups();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setDetails(emptyDetails);
      return;
    }

    if (apiState !== 'online') {
      setDetails(demoDetails(selectedGroupId));
      return;
    }

    let isActive = true;

    async function loadDetails() {
      const fallback = demoDetails(selectedGroupId);
      const results = await Promise.allSettled([
        api.listMembers(selectedGroupId),
        api.listSessions(selectedGroupId),
        api.listTasks(selectedGroupId),
        api.listNotes(selectedGroupId),
        api.listMaterials(selectedGroupId),
        api.listMessages(selectedGroupId),
        api.listPomodoros(selectedGroupId),
      ]);

      if (!isActive) return;
      setDetails({
        members: getArray(results[0], fallback.members),
        sessions: getArray(results[1], fallback.sessions),
        tasks: getArray(results[2], fallback.tasks),
        notes: getArray(results[3], fallback.notes),
        materials: getArray(results[4], fallback.materials),
        messages: getArray(results[5], fallback.messages),
        pomodoros: getArray(results[6], fallback.pomodoros),
      });
    }

    loadDetails();
    return () => {
      isActive = false;
    };
  }, [apiState, selectedGroupId]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = window.setInterval(() => {
      setTimerSeconds((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || null;
  const subjects = useMemo(() => ['All', ...Array.from(new Set(groups.map((group) => group.subject).filter(Boolean)))], [groups]);
  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return groups.filter((group) => {
      const text = `${group.name} ${group.description} ${group.courseCode} ${group.subject} ${(group.tags || []).join(' ')}`.toLowerCase();
      return (subject === 'All' || group.subject === subject) && text.includes(normalizedSearch);
    });
  }, [groups, search, subject]);
  const upcomingSessions = [...details.sessions].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const completedTasks = details.tasks.filter((task) => task.status === 'DONE').length;
  const taskProgress = details.tasks.length ? Math.round((completedTasks / details.tasks.length) * 100) : 0;
  const activePomodoro = details.pomodoros.find((pomodoro) => pomodoro.status === 'RUNNING') || null;

  function addDetail(type, item) {
    setDetails((current) => ({ ...current, [type]: [item, ...current[type]] }));
  }

  async function createGroup(event) {
    event.preventDefault();
    const payload = {
      ...groupForm,
      maxMembers: Number(groupForm.maxMembers),
      tags: groupForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      const created = apiState === 'online'
        ? await api.createGroup(payload)
        : { ...payload, id: Date.now(), memberCount: 1, ownerId: 1, createdAt: new Date().toISOString() };
      setGroups((current) => [created, ...current]);
      setSelectedGroupId(created.id);
      setGroupForm(newGroupInitial);
      setActiveView('overview');
      setStatusText(apiState === 'online' ? 'Group saved to backend' : 'Demo group created locally');
    } catch (error) {
      setStatusText('Group could not be created');
    }
  }

  async function createSession(event) {
    event.preventDefault();
    if (!selectedGroup) return;
    const payload = {
      ...sessionForm,
      startsAt: new Date(sessionForm.startsAt).toISOString(),
      endsAt: new Date(sessionForm.endsAt).toISOString(),
      capacity: Number(sessionForm.capacity),
    };

    try {
      const created = apiState === 'online'
        ? await api.createSession(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, attendeeCount: 1, status: 'SCHEDULED', createdBy: 1, createdAt: new Date().toISOString() };
      addDetail('sessions', created);
      setSessionForm({ title: '', description: '', startsAt: inputDate(90), endsAt: inputDate(180), meetingUrl: '', capacity: 10 });
      setStatusText('Session planned');
    } catch (error) {
      setStatusText('Session could not be planned');
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
      setStatusText('Task added');
    } catch (error) {
      setStatusText('Task could not be added');
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
      setStatusText('Note saved');
    } catch (error) {
      setStatusText('Note could not be saved');
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
      setStatusText('Material added');
    } catch (error) {
      setStatusText('Material could not be added');
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedGroup || !messageText.trim()) return;
    const payload = { content: messageText.trim(), type: 'TEXT', materialId: null };
    try {
      const created = apiState === 'online'
        ? await api.sendMessage(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, senderId: 1, senderName: 'You', sentAt: new Date().toISOString(), editedAt: null };
      addDetail('messages', created);
      setMessageText('');
      setStatusText('Message sent');
    } catch (error) {
      setStatusText('Message could not be sent');
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
      taskId: details.tasks.find((task) => task.status !== 'DONE')?.id || null,
    };
    try {
      const created = apiState === 'online'
        ? await api.startPomodoro(selectedGroup.id, payload)
        : { ...payload, id: Date.now(), groupId: selectedGroup.id, userId: 1, completedCycles: 0, status: 'RUNNING', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setDetails((current) => ({ ...current, pomodoros: [created, ...current.pomodoros] }));
      setTimerSeconds(payload.focusMinutes * 60);
      setTimerRunning(true);
      setStatusText('Focus timer started');
    } catch (error) {
      setStatusText('Focus timer could not be started');
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <Icon name="book" />
            <span />
          </div>
          <div>
            <strong>Study Group Platform</strong>
            <small>Collaborative student workspace</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Application sections">
          {views.map(([id, label, icon]) => (
            <button className={`nav-button ${activeView === id ? 'active' : ''}`} key={id} onClick={() => setActiveView(id)} type="button">
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`api-card ${apiState}`}>
          <span className="status-dot" />
          <div>
            <strong>{apiState === 'online' ? 'Backend online' : apiState === 'demo' ? 'Demo mode' : 'Checking API'}</strong>
            <small>{apiBaseUrl}</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Student study groups</p>
            <h1>{selectedGroup?.name || 'Create your first study group'}</h1>
          </div>
          <div className="status-pill">
            <Icon name={apiState === 'online' ? 'shield' : 'pulse'} />
            <span>{statusText}</span>
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
                upcomingSessions={upcomingSessions}
                setActiveView={setActiveView}
              />
            )}
            {activeView === 'groups' && (
              <Groups
                groups={filteredGroups}
                selectedGroupId={selectedGroupId}
                selectGroup={(id) => {
                  setSelectedGroupId(id);
                  setActiveView('overview');
                }}
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
            {activeView === 'sessions' && <Sessions sessions={upcomingSessions} form={sessionForm} setForm={setSessionForm} submit={createSession} selectedGroup={selectedGroup} />}
            {activeView === 'workspace' && <Workspace tasks={details.tasks} notes={details.notes} taskForm={taskForm} setTaskForm={setTaskForm} noteForm={noteForm} setNoteForm={setNoteForm} createTask={createTask} createNote={createNote} />}
            {activeView === 'materials' && <Materials materials={details.materials} form={materialForm} setForm={setMaterialForm} submit={createMaterial} />}
            {activeView === 'chat' && <Chat messages={details.messages} messageText={messageText} setMessageText={setMessageText} submit={sendMessage} />}
            {activeView === 'focus' && <Focus activePomodoro={activePomodoro} form={focusForm} setForm={setFocusForm} submit={startPomodoro} timerSeconds={timerSeconds} timerRunning={timerRunning} setTimerRunning={setTimerRunning} reset={() => { setTimerRunning(false); setTimerSeconds(Number(focusForm.focusMinutes) * 60); }} />}
          </section>

          <aside className="rail">
            <GroupProfile selectedGroup={selectedGroup} members={details.members} progress={taskProgress} />
            <MiniAgenda sessions={upcomingSessions.slice(0, 3)} />
            <MiniFocus activePomodoro={activePomodoro} seconds={timerSeconds} setActiveView={setActiveView} />
          </aside>
        </div>
      </main>
    </div>
  );
}

function Overview({ selectedGroup, groups, details, taskProgress, activePomodoro, upcomingSessions, setActiveView }) {
  const liveCount = details.sessions.filter((session) => session.status === 'LIVE').length;
  const metrics = [
    ['Active groups', groups.length, 'Groups available', 'users'],
    ['Members', selectedGroup?.memberCount || details.members.length, 'Current group size', 'shield'],
    ['Live sessions', liveCount, 'Happening now', 'video'],
    ['Task progress', `${taskProgress}%`, 'Completed work', 'check'],
  ];

  if (!selectedGroup) {
    return (
      <div className="empty-state">
        <Icon name="users" />
        <h2>No groups yet</h2>
        <p>The backend is connected, but the database does not have a study group yet.</p>
        <button className="primary-button" onClick={() => setActiveView('groups')} type="button">Create group</button>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">Current workspace</p>
          <h2>{selectedGroup.subject}</h2>
          <p>{selectedGroup.description}</p>
          <div className="chip-row">{(selectedGroup.tags || []).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => setActiveView('sessions')} type="button"><Icon name="video" /> Plan session</button>
          <button className="secondary-button" onClick={() => setActiveView('workspace')} type="button"><Icon name="board" /> Open workspace</button>
        </div>
      </section>

      <div className="metrics-grid">
        {metrics.map(([label, value, detail, icon]) => <MetricCard key={label} label={label} value={value} detail={detail} icon={icon} />)}
      </div>

      <div className="two-column">
        <section className="panel">
          <PanelTitle title="Upcoming sessions" action="View all" onAction={() => setActiveView('sessions')} />
          <div className="list">{upcomingSessions.length ? upcomingSessions.slice(0, 3).map((session) => <SessionCard key={session.id} session={session} />) : <EmptyText text="No sessions planned yet." />}</div>
        </section>
        <section className="panel">
          <PanelTitle title="Workspace health" action="Manage" onAction={() => setActiveView('workspace')} />
          <div className="health">
            <div className="progress-circle" style={{ '--progress': `${taskProgress}%` }}><strong>{taskProgress}%</strong></div>
            <div>
              <h3>{details.tasks.length} tasks tracked</h3>
              <p>{details.notes.length} notes, {details.materials.length} materials, and {details.messages.length} messages are attached to this group.</p>
              <div className="chip-row">
                <span className="chip">{activePomodoro ? 'Pomodoro running' : 'Pomodoro ready'}</span>
                <span className="chip">Backend contract ready</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Groups({ groups, selectedGroupId, selectGroup, search, setSearch, subjects, subject, setSubject, form, setForm, submit }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Group discovery" title="Find or create a study group" description="Matches the backend group endpoints for listing, filtering, creating, and joining groups." />
      <div className="toolbar">
        <label className="search-box"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, subject, tag" /></label>
        <select value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="groups-layout">
        <div className="group-grid">
          {groups.map((group) => (
            <button className={`group-card ${selectedGroupId === group.id ? 'selected' : ''}`} key={group.id} onClick={() => selectGroup(group.id)} type="button">
              <div className="card-top"><span className="course">{group.courseCode}</span><span className="visibility">{group.visibility}</span></div>
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className="chip-row">{(group.tags || []).slice(0, 3).map((tag) => <span className="chip" key={tag}>{tag}</span>)}</div>
              <div className="card-footer"><span>{group.memberCount || 0}/{group.maxMembers || '-'} members</span><Icon name="arrow" /></div>
            </button>
          ))}
          {!groups.length && <EmptyText text="No groups match this filter." />}
        </div>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Create group" />
          <Field label="Name"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Course"><input required value={form.courseCode} onChange={(event) => setForm({ ...form, courseCode: event.target.value })} /></Field>
            <Field label="Subject"><input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></Field>
          </div>
          <div className="form-grid">
            <Field label="Members"><input min="2" type="number" value={form.maxMembers} onChange={(event) => setForm({ ...form, maxMembers: event.target.value })} /></Field>
            <Field label="Visibility"><select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value })}><option>PUBLIC</option><option>PRIVATE</option></select></Field>
          </div>
          <Field label="Tags"><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="docker, aws, final" /></Field>
          <button className="primary-button full" type="submit">Create group</button>
        </form>
      </div>
    </div>
  );
}

function Sessions({ sessions, form, setForm, submit, selectedGroup }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Online study sessions" title="Plan structured study time" description={selectedGroup ? `Session schedule for ${selectedGroup.name}.` : 'Select a group before planning sessions.'} />
      <div className="two-column wide-left">
        <section className="panel">
          <PanelTitle title="Schedule" />
          <div className="list">{sessions.length ? sessions.map((session) => <SessionCard detailed key={session.id} session={session} />) : <EmptyText text="No sessions planned yet." />}</div>
        </section>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="New session" />
          <Field label="Title"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <Field label="Meeting URL"><input value={form.meetingUrl} onChange={(event) => setForm({ ...form, meetingUrl: event.target.value })} /></Field>
          <div className="form-grid">
            <Field label="Starts"><input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field>
            <Field label="Ends"><input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field>
          </div>
          <Field label="Capacity"><input min="2" type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></Field>
          <button className="primary-button full" type="submit">Plan session</button>
        </form>
      </div>
    </div>
  );
}

function Workspace({ tasks, notes, taskForm, setTaskForm, noteForm, setNoteForm, createTask, createNote }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Shared workspace" title="Tasks and notes in one place" description="Uses the backend workspace task and note endpoints." />
      <div className="kanban">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
          <section className="task-column" key={status}>
            <div className="column-title"><h3>{status.replace('_', ' ')}</h3><span>{tasks.filter((task) => task.status === status).length}</span></div>
            <div className="list">{tasks.filter((task) => task.status === status).map((task) => <TaskCard key={task.id} task={task} />)}</div>
          </section>
        ))}
      </div>
      <div className="two-column">
        <form className="form-card" onSubmit={createTask}>
          <PanelTitle title="Add task" />
          <Field label="Title"><input required value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} /></Field>
          <Field label="Due date"><input type="datetime-local" value={taskForm.dueAt} onChange={(event) => setTaskForm({ ...taskForm, dueAt: event.target.value })} /></Field>
          <button className="primary-button full" type="submit">Add task</button>
        </form>
        <section className="panel">
          <PanelTitle title="Shared notes" />
          <div className="note-grid">{notes.map((note) => <article className="note-card" key={note.id}><h3>{note.title}</h3><p>{note.content}</p><span>Updated {relative(note.updatedAt)}</span></article>)}</div>
          <form className="inline-form" onSubmit={createNote}>
            <input required placeholder="Note title" value={noteForm.title} onChange={(event) => setNoteForm({ ...noteForm, title: event.target.value })} />
            <textarea required rows="3" placeholder="Note content" value={noteForm.content} onChange={(event) => setNoteForm({ ...noteForm, content: event.target.value })} />
            <button className="secondary-button" type="submit">Save note</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Materials({ materials, form, setForm, submit }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Materials" title="Share links and file metadata" description="Backend currently stores title, description, material type, and URL. Real multipart upload is not implemented in backend yet." />
      <div className="two-column wide-left">
        <section className="panel">
          <PanelTitle title="Shared materials" />
          <div className="list">{materials.length ? materials.map((material) => <a className="material" href={material.url || '#'} key={material.id} rel="noreferrer" target="_blank"><Icon name="file" /><div><h3>{material.title}</h3><p>{material.description}</p><span>{material.type} - {relative(material.uploadedAt)}</span></div><Icon name="arrow" /></a>) : <EmptyText text="No materials shared yet." />}</div>
        </section>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Add material" />
          <Field label="Title"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
          <Field label="Description"><textarea required rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <Field label="Type"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>LINK</option><option>PDF</option><option>DOCUMENT</option><option>IMAGE</option><option>OTHER</option></select></Field>
          <Field label="URL"><input required value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://..." /></Field>
          <button className="primary-button full" type="submit">Add material</button>
        </form>
      </div>
    </div>
  );
}

function Chat({ messages, messageText, setMessageText, submit }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Messaging" title="Keep group decisions visible" description="Uses the backend group message REST endpoints." />
      <section className="chat-panel">
        <div className="messages">{messages.length ? [...messages].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)).map((message) => <article className={`message ${message.senderName === 'You' ? 'mine' : ''}`} key={message.id}><div><strong>{message.senderName}</strong><span>{relative(message.sentAt)}</span></div><p>{message.content}</p></article>) : <EmptyText text="No messages yet." />}</div>
        <form className="composer" onSubmit={submit}><input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message" /><button className="primary-button" type="submit">Send</button></form>
      </section>
    </div>
  );
}

function Focus({ activePomodoro, form, setForm, submit, timerSeconds, timerRunning, setTimerRunning, reset }) {
  return (
    <div className="stack">
      <ViewTitle eyebrow="Pomodoro" title="Run focused study cycles" description="Starts a backend pomodoro session and keeps a local visual timer running." />
      <div className="focus-grid">
        <section className="timer-panel"><span>{activePomodoro?.status || 'READY'}</span><strong>{timer(timerSeconds)}</strong><div><button className="primary-button" type="button" onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? 'Pause' : 'Start'}</button><button className="secondary-button" type="button" onClick={reset}>Reset</button></div></section>
        <form className="form-card" onSubmit={submit}>
          <PanelTitle title="Cycle settings" />
          <div className="form-grid">
            <Field label="Focus"><input min="1" type="number" value={form.focusMinutes} onChange={(event) => setForm({ ...form, focusMinutes: event.target.value })} /></Field>
            <Field label="Short break"><input min="1" type="number" value={form.shortBreakMinutes} onChange={(event) => setForm({ ...form, shortBreakMinutes: event.target.value })} /></Field>
          </div>
          <div className="form-grid">
            <Field label="Long break"><input min="1" type="number" value={form.longBreakMinutes} onChange={(event) => setForm({ ...form, longBreakMinutes: event.target.value })} /></Field>
            <Field label="Cycles"><input min="1" type="number" value={form.cycleCount} onChange={(event) => setForm({ ...form, cycleCount: event.target.value })} /></Field>
          </div>
          <button className="primary-button full" type="submit">Start pomodoro</button>
        </form>
      </div>
    </div>
  );
}

function GroupProfile({ selectedGroup, members, progress }) {
  return (
    <section className="rail-card">
      <PanelTitle title="Group profile" />
      {selectedGroup ? (
        <>
          <span className="course">{selectedGroup.courseCode}</span>
          <h3>{selectedGroup.subject}</h3>
          <p>{selectedGroup.description}</p>
          <div className="rail-metric"><span>Members</span><strong>{selectedGroup.memberCount || members.length}/{selectedGroup.maxMembers || '-'}</strong></div>
          <div className="rail-metric"><span>Progress</span><strong>{progress}%</strong></div>
          <div className="avatars">{members.slice(0, 4).map((member) => <span key={member.userId}>{initials(member.fullName)}</span>)}</div>
        </>
      ) : <p>No group selected yet.</p>}
    </section>
  );
}

function MiniAgenda({ sessions }) {
  return <section className="rail-card"><PanelTitle title="Today" /><div className="mini-list">{sessions.length ? sessions.map((session) => <div className="mini-item" key={session.id}><Icon name="video" /><div><strong>{session.title}</strong><span>{shortDate(session.startsAt)}</span></div></div>) : <EmptyText text="No sessions." />}</div></section>;
}

function MiniFocus({ activePomodoro, seconds, setActiveView }) {
  return <section className="rail-card focus-card"><PanelTitle title="Focus timer" /><strong className="mini-time">{timer(seconds)}</strong><p>{activePomodoro ? `${activePomodoro.completedCycles}/${activePomodoro.cycleCount} cycles` : 'Ready for a new cycle'}</p><button className="secondary-button full" onClick={() => setActiveView('focus')} type="button">Open focus</button></section>;
}

function MetricCard({ label, value, detail, icon }) {
  return <article className="metric-card"><span><Icon name={icon} /></span><strong>{value}</strong><h3>{label}</h3><p>{detail}</p></article>;
}

function SessionCard({ session, detailed }) {
  return <article className="session-card"><span className={`session-dot ${session.status.toLowerCase()}`}><Icon name={session.status === 'LIVE' ? 'play' : 'clock'} /></span><div><div className="item-row"><h3>{session.title}</h3><span className={`badge ${session.status.toLowerCase()}`}>{session.status}</span></div><p>{session.description}</p><div className="meta"><span>{shortDate(session.startsAt)}</span><span>{session.attendeeCount || 0}/{session.capacity || '-'} attendees</span>{detailed && session.meetingUrl && <span>{session.meetingUrl}</span>}</div></div></article>;
}

function TaskCard({ task }) {
  return <article className="task-card"><h3>{task.title}</h3><p>{task.description}</p><span>Due {shortDate(task.dueAt)}</span></article>;
}

function PanelTitle({ title, action, onAction }) {
  return <div className="panel-title"><h2>{title}</h2>{action && <button onClick={onAction} type="button">{action}<Icon name="arrow" /></button>}</div>;
}

function ViewTitle({ eyebrow, title, description }) {
  return <section className="view-title"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></section>;
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
    sessions: demoSessions[groupId] || [],
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
  const date = new Date(Date.now() + minutes * 60000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
}

function shortDate(value) {
  if (!value) return 'Not scheduled';
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
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function Icon({ name }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    video: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z',
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
  };
  return (
    <svg aria-hidden="true" className="icon" fill="none" viewBox="0 0 24 24">
      <path d={paths[name] || paths.grid} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default App;
