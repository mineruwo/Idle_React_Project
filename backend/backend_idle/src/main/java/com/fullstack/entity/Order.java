package com.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String departure;
    private String arrival;
    private double distance;
    private String date;
    private boolean isImmediate;
    private String weight;
    private String vehicle;
    private String cargoType;
    private String cargoSize;
    private String packingOptions;
}
