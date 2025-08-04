package com.fullstack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class CustomerEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL의 SERIAL에 매핑
	@Column(name = "ID_NUM")
	private Integer idNum;
}
