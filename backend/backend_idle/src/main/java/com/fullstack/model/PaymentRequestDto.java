package com.fullstack.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PaymentRequestDto {

	@JsonProperty("merchantUid")
	private String merchantUid; // 상점 고유 주문번호 (프론트에서 생성하여 넘겨줌)
    @JsonProperty("itemName")
    private String itemName;
    @JsonProperty("amount")
    private Long amount;
    @JsonProperty("buyerName")
    private String buyerName;
    @JsonProperty("buyerEmail")
    private String buyerEmail;
    @JsonProperty("userId")
    private Integer userId; // 사용자 ID 추가
    @JsonProperty("pointsToUse")
    private Integer pointsToUse; // 사용할 포인트
	
}

