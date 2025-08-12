// com.fullstack.entity.DriverOffer
package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "driver_offers",
    indexes = {
        @Index(name = "idx_driver_offers_order", columnList = "order_id"),
        @Index(name = "idx_driver_offers_driver", columnList = "driverId")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOffer {

    public enum Status { PENDING, ACCEPTED, REJECTED, EXPIRED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)               // 주문 다:1
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Long driverId;                            // Driver 엔티티 생기면 ManyToOne으로 교체 가능

    @Column(nullable = false)
    private Long price;

    private String memo;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
