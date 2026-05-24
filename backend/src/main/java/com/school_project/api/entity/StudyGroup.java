package com.school_project.api.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "study_groups")
public class StudyGroup extends BaseEntity implements Serializable {

    public enum Visibility {
        PUBLIC,
        PRIVATE
    }

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String courseCode;

    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility = Visibility.PUBLIC;

    private Integer maxMembers;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id")
    private StudentUser owner;

    @ElementCollection
    @CollectionTable(name = "study_group_tags", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "tag", nullable = false)
    private List<String> tags = new ArrayList<>();
}
