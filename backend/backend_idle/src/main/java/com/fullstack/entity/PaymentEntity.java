package com.fullstack.entity;

import com.fullstack.model.PaymentDto;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private String ORDER_ID;

	private Long ID_NUM;

	private String FK_ORDER_ID;

	private String PAYMENT_RESULT_LOG;

	private Boolean PAYMENT_SUCCESS_STATUS;

	private Long amount;

	private String paid_type;
	
	private String product_type;
	

	public void PaymentDtoToEntity(PaymentDto dto)
	{
		this.ORDER_ID = dto.getORDER_ID();
		this.FK_ORDER_ID = dto.getFK_ORDER_ID();
		this.PAYMENT_RESULT_LOG = dto.getPAYMENT_RESULT_LOG();
		this.PAYMENT_SUCCESS_STATUS = dto.getPAYMENT_SUCCESS_STATUS();
		this.amount = dto.getAmount();
		this.paid_type = dto.getPaid_type();
		this.product_type = dto.getProduct_type();
	}
	
}









