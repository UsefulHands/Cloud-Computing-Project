package com.school_project.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pomodoro_sessions")
public class PomodoroSession extends BaseEntity {

    public enum Status {
        RUNNING,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id")
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private StudentUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private WorkspaceTask task;

    @Column(nullable = false)
    private Integer focusMinutes;

    @Column(nullable = false)
    private Integer shortBreakMinutes;

    @Column(nullable = false)
    private Integer longBreakMinutes;

    @Column(nullable = false)
    private Integer cycleCount;

    @Column(nullable = false)
    private Integer completedCycles = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.RUNNING;

    @Column(nullable = false)
    private Instant startedAt = Instant.now();
}
