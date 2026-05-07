const now = Date.now();

const minutesFromNow = (minutes) => new Date(now + minutes * 60000).toISOString();
const minutesAgo = (minutes) => new Date(now - minutes * 60000).toISOString();

export const demoGroups = [
  {
    id: 1,
    name: 'Cloud Computing Final Prep',
    description: 'Final exam study room for Docker, deployment, scaling, storage, and distributed systems.',
    courseCode: 'CSE401',
    subject: 'Cloud Computing',
    visibility: 'PUBLIC',
    maxMembers: 12,
    memberCount: 8,
    tags: ['docker', 'aws', 'deployment'],
    ownerId: 1,
    createdAt: minutesAgo(1800),
  },
  {
    id: 2,
    name: 'Database Project Studio',
    description: 'Schema review, SQL practice, normalization notes, and project milestone tracking.',
    courseCode: 'CSE305',
    subject: 'Database Systems',
    visibility: 'PRIVATE',
    maxMembers: 10,
    memberCount: 5,
    tags: ['postgresql', 'sql', 'schema'],
    ownerId: 2,
    createdAt: minutesAgo(5200),
  },
  {
    id: 3,
    name: 'Algorithms Problem Lab',
    description: 'Weekly sessions for graphs, dynamic programming, greedy algorithms, and exam-style questions.',
    courseCode: 'CSE204',
    subject: 'Algorithms',
    visibility: 'PUBLIC',
    maxMembers: 14,
    memberCount: 9,
    tags: ['graphs', 'dp', 'complexity'],
    ownerId: 3,
    createdAt: minutesAgo(7400),
  },
];

export const demoMembers = {
  1: [
    { userId: 1, fullName: 'Dev Student', email: 'dev.student@mail.com', role: 'OWNER', joinedAt: minutesAgo(1800) },
    { userId: 2, fullName: 'Ada Lovelace', email: 'ada@university.edu', role: 'MODERATOR', joinedAt: minutesAgo(1500) },
    { userId: 3, fullName: 'Alan Turing', email: 'alan@university.edu', role: 'MEMBER', joinedAt: minutesAgo(900) },
  ],
  2: [
    { userId: 4, fullName: 'Grace Hopper', email: 'grace@university.edu', role: 'OWNER', joinedAt: minutesAgo(5200) },
    { userId: 5, fullName: 'Katherine Johnson', email: 'katherine@university.edu', role: 'MEMBER', joinedAt: minutesAgo(4300) },
  ],
  3: [
    { userId: 6, fullName: 'Edsger Dijkstra', email: 'edsger@university.edu', role: 'OWNER', joinedAt: minutesAgo(7400) },
    { userId: 7, fullName: 'Barbara Liskov', email: 'barbara@university.edu', role: 'MEMBER', joinedAt: minutesAgo(2500) },
  ],
};

export const demoSessions = {
  1: [
    {
      id: 101,
      groupId: 1,
      title: 'Docker compose checkpoint',
      description: 'Verify local database, backend startup, and environment variables before the final demo.',
      startsAt: minutesFromNow(80),
      endsAt: minutesFromNow(160),
      meetingUrl: 'https://meet.example.com/cloud-checkpoint',
      capacity: 12,
      attendeeCount: 6,
      status: 'SCHEDULED',
      createdBy: 1,
      createdAt: minutesAgo(300),
    },
    {
      id: 102,
      groupId: 1,
      title: 'Scaling and storage review',
      description: 'Short review for autoscaling, object storage, and load balancing concepts.',
      startsAt: minutesAgo(20),
      endsAt: minutesFromNow(35),
      meetingUrl: 'https://meet.example.com/cloud-live',
      capacity: 8,
      attendeeCount: 5,
      status: 'LIVE',
      createdBy: 2,
      createdAt: minutesAgo(600),
    },
  ],
  2: [
    {
      id: 201,
      groupId: 2,
      title: 'ER diagram review',
      description: 'Review relationships and table boundaries for the project schema.',
      startsAt: minutesFromNow(190),
      endsAt: minutesFromNow(270),
      meetingUrl: 'https://meet.example.com/db-review',
      capacity: 10,
      attendeeCount: 3,
      status: 'SCHEDULED',
      createdBy: 4,
      createdAt: minutesAgo(720),
    },
  ],
  3: [],
};

export const demoTasks = {
  1: [
    {
      id: 1001,
      groupId: 1,
      title: 'Write deployment checklist',
      description: 'Document Docker, backend, and frontend commands in order.',
      assignedTo: 1,
      dueAt: minutesFromNow(420),
      status: 'IN_PROGRESS',
      createdAt: minutesAgo(900),
      updatedAt: minutesAgo(30),
    },
    {
      id: 1002,
      groupId: 1,
      title: 'Summarize storage options',
      description: 'Compare block storage, object storage, and managed database storage.',
      assignedTo: 2,
      dueAt: minutesFromNow(1400),
      status: 'TODO',
      createdAt: minutesAgo(700),
      updatedAt: minutesAgo(700),
    },
    {
      id: 1003,
      groupId: 1,
      title: 'Collect exam questions',
      description: 'Add likely exam questions to the shared notes.',
      assignedTo: 3,
      dueAt: minutesAgo(120),
      status: 'DONE',
      createdAt: minutesAgo(1200),
      updatedAt: minutesAgo(90),
    },
  ],
  2: [
    {
      id: 2001,
      groupId: 2,
      title: 'Normalize task table',
      description: 'Check project tables against 3NF.',
      assignedTo: 5,
      dueAt: minutesFromNow(1200),
      status: 'TODO',
      createdAt: minutesAgo(480),
      updatedAt: minutesAgo(480),
    },
  ],
  3: [],
};

export const demoNotes = {
  1: [
    {
      id: 501,
      groupId: 1,
      title: 'Cloud final outline',
      content: 'Containers, Docker Compose, networking, storage, scaling, deployment, and fault tolerance.',
      updatedBy: 2,
      updatedAt: minutesAgo(55),
    },
    {
      id: 502,
      groupId: 1,
      title: 'Project runtime',
      content: 'Start database first, then backend, then frontend. Keep environment values consistent.',
      updatedBy: 1,
      updatedAt: minutesAgo(150),
    },
  ],
  2: [
    {
      id: 601,
      groupId: 2,
      title: 'SQL reminders',
      content: 'Use indexes for search-heavy columns and verify joins with sample data.',
      updatedBy: 4,
      updatedAt: minutesAgo(85),
    },
  ],
  3: [],
};

export const demoMaterials = {
  1: [
    {
      id: 801,
      groupId: 1,
      title: 'Docker Compose documentation',
      description: 'Reference for services, ports, environment variables, and volumes.',
      type: 'LINK',
      url: 'https://docs.docker.com/compose/',
      uploadedBy: 1,
      uploadedAt: minutesAgo(240),
    },
    {
      id: 802,
      groupId: 1,
      title: 'Cloud patterns PDF',
      description: 'Summary document for common deployment and scaling patterns.',
      type: 'PDF',
      url: '#',
      uploadedBy: 2,
      uploadedAt: minutesAgo(880),
    },
  ],
  2: [],
  3: [],
};

export const demoMessages = {
  1: [
    {
      id: 901,
      groupId: 1,
      senderId: 2,
      senderName: 'Ada Lovelace',
      content: 'I added the Docker Compose reference. Let us verify the exact commands before the next session.',
      type: 'TEXT',
      materialId: null,
      sentAt: minutesAgo(60),
      editedAt: null,
    },
    {
      id: 902,
      groupId: 1,
      senderId: 1,
      senderName: 'Dev Student',
      content: 'I will handle the runtime checklist and add screenshots after testing.',
      type: 'TEXT',
      materialId: null,
      sentAt: minutesAgo(25),
      editedAt: null,
    },
  ],
  2: [],
  3: [],
};

export const demoPomodoros = {
  1: [
    {
      id: 1101,
      groupId: 1,
      userId: 1,
      taskId: 1001,
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cycleCount: 4,
      completedCycles: 1,
      status: 'RUNNING',
      startedAt: minutesAgo(12),
      updatedAt: minutesAgo(1),
    },
  ],
  2: [],
  3: [],
};
