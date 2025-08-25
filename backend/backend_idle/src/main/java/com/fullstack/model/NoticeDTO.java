package com.fullstack.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    private Boolean isDel;
    private String title;
    private LocalDateTime updatedAt;
    private String writerAdminId;
    private Integer viewCount; // New field
}