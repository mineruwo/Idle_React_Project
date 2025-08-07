package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class TransportSummaryDTO {
	
	private String name;
	private int completed;
	private int inProgress;
	private int scheduled;
	private int total;
	
	private long revenue;
	private int commission;
	private long settlement;
	
}
