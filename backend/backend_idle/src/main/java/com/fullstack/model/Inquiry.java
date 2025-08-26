package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "inquiry")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

        @Id
    @GeneratedValue(generator = "uuid2")
    @Column(name = "inquiry_id")
    private UUID inquiryId;

    @Column(name = "customer_id_num", nullable = false)
    private Long customerIdNum;

    @Column(name = "inquiry_title", nullable = false, length = 255)
    private String inquiryTitle;

    @Column(name = "inquiry_content", nullable = false, columnDefinition = "TEXT")
    private String inquiryContent;

    @Column(name = "inquiry_answer", columnDefinition = "TEXT")
    private String inquiryAnswer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "admin_id_index")
    private Long adminIdIndex;

    @Column(name = "admin_id", length = 255)
    private String adminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private InquiryStatus status;

    @Column(name = "re_inquiry_id")
    private UUID reInquiryId;

    @PrePersist
    protected void onCreate() {
        if (inquiryId == null) {
            inquiryId = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = InquiryStatus.INQUIRY_PENDING;
        }
    }
}
