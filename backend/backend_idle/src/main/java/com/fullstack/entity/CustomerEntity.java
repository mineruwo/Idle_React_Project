package com.fullstack.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor; // 추가
import lombok.Setter;

@NoArgsConstructor  
@AllArgsConstructor
@Entity
@Table(name = "customer")
@Builder
@Getter
@Setter
public class CustomerEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL의 SERIAL에 매핑
	@Column(name = "ID_NUM")
	private Integer idNum;

	@Column(name = "ID", nullable = false)
	private String id;

	@Column(name = "PASSWORD_ENC", nullable = false)
	private String passwordEnc;

	@Column(name = "CUSTOM_NAME")
	private String customName;

	@Column(name = "ROLE")
	private String role;

	@Column(name = "CREATED_AT", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "UPDATED_AT")
	private LocalDateTime updatedAt;

	@Column(name = "PHONE", nullable = false)
	private String phone;

	@Column(name = "NICKNAME", nullable = false)
	private String nickname;

	@Column(name = "SNS_LOGIN_PROVIDER")
	private String snsLoginProvider;

	@Column(name = "SNS_PROVIDER_ID")
	private String snsProviderId;

	@Column(name = "LEFTED_AT")
	private LocalDateTime leftedAt;

	@Column(name = "IS_LEFTED", nullable = false)
	private Boolean isLefted;

	@Column(name = "USER_POINT", nullable = false)
	private Integer userPoint;
	
	@Column(name="REFRESH_TOKEN", length=128) // 해시 저장 권장
	private String refreshToken;
	
	@Column(name="RT_EXPIRES_AT")
	private LocalDateTime rtExpiresAt;
	
	@Column(name = "AVATAR_URL", length = 200)
	private String avatarUrl;
	
}