package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fullstack.entity.Order;
import com.fullstack.model.enums.OrderStatus;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderDto {

    private Long id;
    private String orderNo;
    private String shipperNickname;
    private Integer proposedPrice;
    private Long driverPrice;
    private Long avgPrice;
    private String packingOptions;

    private Long assignedDriverId;

    private String departure;
    private String arrival;
    private double distance;

    private String date;
    private String reservedDate;

    private boolean isImmediate;
    private String weight;
    private String vehicle;
    private String cargoType;
    private String cargoSize;

    private String packingOption;

    private OrderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime departedAt;
    private LocalDateTime completedAt;

    private LocalDateTime assignedAt; // assignedAt 필드 추가

    public static OrderDto fromEntity(Order entity, String shipperNickname) {
        OrderDto dto = new OrderDto();
        dto.setId(entity.getId());
        dto.setOrderNo(entity.getOrderNo());
        dto.setShipperNickname(shipperNickname);
        dto.setProposedPrice(entity.getProposedPrice());
        dto.setDriverPrice(entity.getDriverPrice());
        dto.setAvgPrice(entity.getAvgPrice());
        dto.setPackingOption(entity.getPackingOption());
        dto.setDeparture(entity.getDeparture());
        dto.setArrival(entity.getArrival());
        dto.setDistance(entity.getDistance());
        dto.setReservedDate(entity.getReservedDate());
        dto.setImmediate(entity.getIsImmediate());
        dto.setWeight(entity.getWeight());
        dto.setVehicle(entity.getVehicle());
        dto.setCargoType(entity.getCargoType());
        dto.setCargoSize(entity.getCargoSize());
        dto.setAssignedDriverId(entity.getAssignedDriverId());
        
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setDepartedAt(entity.getDepartedAt());
        dto.setCompletedAt(entity.getCompletedAt());
        // assignedAt 필드는 OrderService에서 DriverOffer 정보를 조회하여 설정됩니다.
        // 여기서는 entity.getAssignedAt()을 호출하지 않습니다.

        OrderStatus statusEnum = entity.getStatus();
        String statusString = null;
        if (statusEnum != null) {
            statusString = statusEnum.name();
        }

        try {
            if (statusString != null && !statusString.isEmpty()) {
                dto.setStatus(OrderStatus.valueOf(statusString.toUpperCase()));
            } else {
                System.err.println("Entity status is null or empty. Setting to NONE.");
                dto.setStatus(OrderStatus.NONE);
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Unknown OrderStatus: " + statusString + ". Setting to NONE.");
            dto.setStatus(OrderStatus.NONE);
        }
        return dto;
    }
}