package com.fullstack.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
	
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String departure;
	    private String arrival;
	    private String cargoType;
	    private String cargoSize;
	    private String weight;
	    private String vehicle;
	    private boolean isImmediate;
	    private String reservedDate;
	    private String distance;
		public static Object builder() {
			// TODO Auto-generated method stub
			return null;
		}

    // 생성자, Getter/Setter 생략
}
