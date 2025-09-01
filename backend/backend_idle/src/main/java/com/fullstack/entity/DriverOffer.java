// com.fullstack.entity.DriverOffer
package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_offers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 오더 (다:1 관계) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    /** 기사 (CustomerEntity.idNum 기준 FK) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id_num", referencedColumnName = "ID_NUM", nullable = false)
    private CustomerEntity driver;

    /** 입찰가 */
    @Column(nullable = false)
    private Long price;

    /** 추가 메모 (선택 사항) */
    private String memo;

    /** 입찰 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    /** 생성일시 */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 수정일시 */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** 저장 직전 실행 → createdAt, updatedAt 자동 세팅 */
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = Status.PENDING;
        }
    }

    /** 수정 직전 실행 → updatedAt 자동 갱신 */
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING,   // 대기 (기본값)
        ACCEPTED,  // 화주가 채택
        REJECTED,  // 거절
        EXPIRED    // 만료 (예: 시간 초과)
    }
}
