package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "car_owner_order",
       indexes = {
           @Index(name = "idx_order_owner", columnList = "owner_id"),
           @Index(name = "idx_order_status", columnList = "status")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CarOwnerOrderList {

    public enum Status { READY, ONGOING, COMPLETED, CANCELED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="owner_id", nullable=false, length=50)
    private String ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false, length=20)
    private Status status;

    // 기본 정보
    @Column(name="departure", nullable=false) private String departure;
    @Column(name="arrival",   nullable=false) private String arrival;
    @Column(name="cargo_type", nullable=false) private String cargoType;
    @Column(name="cargo_size") private String cargoSize;
    @Column(name="weight")     private String weight;
    @Column(name="vehicle")    private String vehicle; // 희망 차량

    @Column(name="immediate", nullable=false) private boolean immediate;
    @Column(name="reserved_date") private String reservedDate;
    @Column(name="distance")      private String distance;

    // 가격/배차
    @Column(name="vehicle_id") private Long vehicleId;
    @Column(name="proposed_price") private Integer proposedPrice;
    @Column(name="final_price")    private Integer finalPrice;

    // 타임스탬프
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = Status.READY;
    }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    // ===== 도메인 동작 =====
    public void changeStatus(Status next) {
        // 간단 검증(팀 규칙에 맞게 강화 가능)
        if (this.status == Status.CANCELED && next != Status.CANCELED) {
            throw new IllegalStateException("CANCELED_CANNOT_TRANSIT");
        }
        this.status = next;
    }

    public void assignVehicle(Long vehicleId) { this.vehicleId = vehicleId; }

    public void applyUpdate(String departure, String arrival, String cargoType, String cargoSize,
                            String weight, String vehicle, Boolean immediate, String reservedDate,
                            String distance, Integer proposedPrice) {
        if (departure != null) this.departure = departure;
        if (arrival != null) this.arrival = arrival;
        if (cargoType != null) this.cargoType = cargoType;
        if (cargoSize != null) this.cargoSize = cargoSize;
        if (weight != null) this.weight = weight;
        if (vehicle != null) this.vehicle = vehicle;
        if (immediate != null) this.immediate = immediate;
        if (reservedDate != null) this.reservedDate = reservedDate;
        if (distance != null) this.distance = distance;
        if (proposedPrice != null) this.proposedPrice = proposedPrice;
    }
}
