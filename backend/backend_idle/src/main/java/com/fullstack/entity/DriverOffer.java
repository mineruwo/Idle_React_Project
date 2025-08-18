// com.fullstack.entity.DriverOffer
package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "driver_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverOffer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 주문 다:1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // ✅ 기사(CustomerEntity) FK로 조인 (ID_NUM)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id_num", referencedColumnName = "ID_NUM", nullable = false)
    private CustomerEntity driver;

    @Column(nullable = false)
    private Long price;

    private String memo;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate(){ this.updatedAt = LocalDateTime.now(); }

    public enum Status { PENDING, ACCEPTED, REJECTED, EXPIRED }
}
