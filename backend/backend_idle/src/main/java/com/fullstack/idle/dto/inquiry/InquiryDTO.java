package com.fullstack.idle.dto.inquiry;

import com.fullstack.idle.model.inquiry.InquiryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDTO {
    private UUID inquiryId;
    private Long customerIdNum;
    private String inquiryTitle;
    private String inquiryContent;
    private String inquiryAnswer;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;
    private Long adminIdIndex;
    private String adminId;
    private InquiryStatus status;
    private UUID reInquiryId;
}
