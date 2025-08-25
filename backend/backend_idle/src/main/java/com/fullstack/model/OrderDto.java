package com.fullstack.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fullstack.entity.Order;
import com.fullstack.model.enums.OrderStatus; // Added import

@Getter
@Setter
public class OrderDto {

    private Long id;
    private String orderNo; // Add this field
    private String shipperNickname; // Add this field
    private Integer proposedPrice;      // 화주 제안가
    private Long driverPrice;           // 기사 제안가
    private Long avgPrice;
    private String packingOptions;      // JSON 문자열로 체크된 포장 옵션들

    private String departure;           // 출발지
    private String arrival;             // 도착지
    private double distance;            // 거리

    private String date;                // 등록일 (필요 시)
    private String reservedDate;        // 예약 시간

    private boolean isImmediate;        // 즉시배송 여부
    private String weight;              // 무게
    private String vehicle;             // 차량 종류
    private String cargoType;           // 화물 종류
    private String cargoSize;           // 화물 크기

    private String packingOption;       // 포장 옵션 (ex: "특수포장, 고가화물")

    private OrderStatus status;              // 상태 (optional: 미배차, 배차완료 등) // Changed type

    public static OrderDto fromEntity(Order entity, String shipperNickname) {
        OrderDto dto = new OrderDto();
        dto.setId(entity.getId());
        dto.setOrderNo(entity.getOrderNo()); // Add this line
        dto.setShipperNickname(shipperNickname); // Set nickname
        dto.setProposedPrice(entity.getProposedPrice());
        dto.setDriverPrice(entity.getDriverPrice());
        dto.setAvgPrice(entity.getAvgPrice());
        dto.setPackingOption(entity.getPackingOption());
        dto.setDeparture(entity.getDeparture());
        dto.setArrival(entity.getArrival());
        dto.setDistance(entity.getDistance());
        dto.setReservedDate(entity.getReservedDate());
        dto.setImmediate(entity.isImmediate());   // ✅ 수정된 부분
        dto.setWeight(entity.getWeight());
        dto.setVehicle(entity.getVehicle());
        dto.setCargoType(entity.getCargoType());
        dto.setCargoSize(entity.getCargoSize());
                OrderStatus statusEnum = entity.getStatus(); // Changed type to OrderStatus
        String statusString = null; // Initialize to null
        if (statusEnum != null) {
            statusString = statusEnum.name(); // Get the enum name as string
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
