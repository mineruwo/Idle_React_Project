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
	private String merchantUid;
    @JsonProperty("itemName")
    private String itemName;
    @JsonProperty("amount")
    private Long amount;
    @JsonProperty("buyerName")
    private String buyerName;
    @JsonProperty("buyerEmail")
    private String buyerEmail;
    @JsonProperty("userId")
    private Integer userId;
    @JsonProperty("pointsToUse")
    private Integer pointsToUse;
    @JsonProperty("pgProvider")
    private String pgProvider;
	
}

