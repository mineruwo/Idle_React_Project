package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ORDER_PROP")
public class OrderProp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="PROP_ID", nullable = false)
    private Long propId;

    @OneToOne
    @JoinColumn(name = "ORDER_ID", nullable = false)
    private Order order;

    @Column(name="ID_NUM_T", nullable = false)
    private Integer idNumT;

    @Column(name="PROPOSED_PRICE", nullable = false)
    private Integer proposedPrice;

    @Column(name="COMMISSIONRATE", nullable = false)
    private double commissionRate;
}
