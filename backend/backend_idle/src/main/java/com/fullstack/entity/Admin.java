package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import com.fullstack.model.enums.AdminRole;



@Entity
@Table(name = "ADMIN")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_INDEX")
    private Integer idIndex;

    @Column(name = "ADMIN_ID", nullable = false, unique = true)
    private String adminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false)
    private AdminRole role;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "NAME")
    private String name;

    @Column(name = "EMPL_ID")
    private String emplId;

    @CreationTimestamp
    @Column(name = "REG_DATE", updatable = false)
    private LocalDateTime regDate;

    @Column(name = "DEL_DATE")
    private LocalDateTime delDate;

    @Column(name = "IS_DEL")
    @Builder.Default
    private boolean isDel = false;
}
