-- ============================================================
-- V1 : Initial schema – all entity tables
-- ============================================================

CREATE TABLE student_users (
    id            BIGSERIAL    PRIMARY KEY,
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ  NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    university    VARCHAR(255),
    department    VARCHAR(255)
);

-- ----------------------------------------------------------------

CREATE TABLE study_groups (
    id          BIGSERIAL    PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    course_code VARCHAR(255),
    subject     VARCHAR(255),
    visibility  VARCHAR(50)  NOT NULL DEFAULT 'PUBLIC',
    max_members INTEGER,
    owner_id    BIGINT       NOT NULL REFERENCES student_users(id)
);

CREATE TABLE study_group_tags (
    group_id BIGINT       NOT NULL REFERENCES study_groups(id),
    tag      VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------

CREATE TABLE group_members (
    id         BIGSERIAL   PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    group_id   BIGINT      NOT NULL REFERENCES study_groups(id),
    user_id    BIGINT      NOT NULL REFERENCES student_users(id),
    role       VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMPTZ NOT NULL,
    UNIQUE (group_id, user_id)
);

-- ----------------------------------------------------------------

CREATE TABLE study_sessions (
    id          BIGSERIAL    PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    group_id    BIGINT       NOT NULL REFERENCES study_groups(id),
    created_by  BIGINT       NOT NULL REFERENCES student_users(id),
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    starts_at   TIMESTAMPTZ  NOT NULL,
    ends_at     TIMESTAMPTZ  NOT NULL,
    meeting_url VARCHAR(255),
    capacity    INTEGER,
    status      VARCHAR(50)  NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE session_attendees (
    id         BIGSERIAL   PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    session_id BIGINT      NOT NULL REFERENCES study_sessions(id),
    user_id    BIGINT      NOT NULL REFERENCES student_users(id),
    joined_at  TIMESTAMPTZ NOT NULL,
    UNIQUE (session_id, user_id)
);

-- ----------------------------------------------------------------

CREATE TABLE study_materials (
    id          BIGSERIAL     PRIMARY KEY,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ   NOT NULL,
    group_id    BIGINT        NOT NULL REFERENCES study_groups(id),
    title       VARCHAR(255)  NOT NULL,
    description VARCHAR(2000),
    type        VARCHAR(50)   NOT NULL DEFAULT 'OTHER',
    url         VARCHAR(2000) NOT NULL,
    uploaded_by BIGINT        NOT NULL REFERENCES student_users(id)
);

-- ----------------------------------------------------------------

CREATE TABLE chat_messages (
    id          BIGSERIAL    PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    group_id    BIGINT       NOT NULL REFERENCES study_groups(id),
    sender_id   BIGINT       NOT NULL REFERENCES student_users(id),
    content     VARCHAR(4000) NOT NULL,
    type        VARCHAR(50)  NOT NULL DEFAULT 'TEXT',
    material_id BIGINT       REFERENCES study_materials(id),
    edited_at   TIMESTAMPTZ
);

-- ----------------------------------------------------------------

CREATE TABLE workspace_notes (
    id         BIGSERIAL      PRIMARY KEY,
    created_at TIMESTAMPTZ    NOT NULL,
    updated_at TIMESTAMPTZ    NOT NULL,
    group_id   BIGINT         NOT NULL REFERENCES study_groups(id),
    title      VARCHAR(255)   NOT NULL,
    content    VARCHAR(10000) NOT NULL,
    updated_by BIGINT         NOT NULL REFERENCES student_users(id)
);

-- ----------------------------------------------------------------

CREATE TABLE workspace_tasks (
    id          BIGSERIAL    PRIMARY KEY,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    group_id    BIGINT       NOT NULL REFERENCES study_groups(id),
    title       VARCHAR(255) NOT NULL,
    description VARCHAR(4000),
    assigned_to BIGINT       REFERENCES student_users(id),
    due_at      TIMESTAMPTZ,
    status      VARCHAR(50)  NOT NULL DEFAULT 'TODO'
);

-- ----------------------------------------------------------------

CREATE TABLE pomodoro_sessions (
    id                  BIGSERIAL   PRIMARY KEY,
    created_at          TIMESTAMPTZ NOT NULL,
    updated_at          TIMESTAMPTZ NOT NULL,
    group_id            BIGINT      NOT NULL REFERENCES study_groups(id),
    user_id             BIGINT      NOT NULL REFERENCES student_users(id),
    task_id             BIGINT      REFERENCES workspace_tasks(id),
    focus_minutes       INTEGER     NOT NULL,
    short_break_minutes INTEGER     NOT NULL,
    long_break_minutes  INTEGER     NOT NULL,
    cycle_count         INTEGER     NOT NULL,
    completed_cycles    INTEGER     NOT NULL DEFAULT 0,
    status              VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    started_at          TIMESTAMPTZ NOT NULL
);
