package com.fullstack.model;

import com.fullstack.entity.ReviewEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private Integer id;
    private Integer rating;
    private String content;
    private String authorNickname;
    private String targetNickname;
    private Integer targetId;
    private LocalDateTime createdAt;
    private Long orderId;

    public static ReviewResponseDTO fromEntity(ReviewEntity entity) {
        return ReviewResponseDTO.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .content(entity.getContent())
                .authorNickname(entity.getAuthor() != null ? entity.getAuthor().getNickname() : null)
                .targetNickname(entity.getTarget() != null ? entity.getTarget().getNickname() : null)
                .targetId(entity.getTarget() != null ? entity.getTarget().getIdNum() : null)
                .createdAt(entity.getCreatedAt())
                .orderId(entity.getOrder() != null ? entity.getOrder().getId() : null)
                .build();
    }
}
