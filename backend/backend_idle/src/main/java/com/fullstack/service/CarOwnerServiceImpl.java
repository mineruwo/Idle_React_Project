package com.fullstack.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarOwnerServiceImpl implements CarOwnerService{
	
	private final CustomerRepository customerRepository;
	
	
	
	@Override
	public CarOwnerProfileDTO getProfile(String customName) {
		CustomerEntity entity = customerRepository.findByCustomName(customName)
				.orElseThrow(()->new RuntimeException("회원 정보를 찾을 수 없습니다."));
		
		return CarOwnerProfileDTO.builder()
				.nickname(entity.getNickname())
				.customName(entity.getCustomName())
				.phone(entity.getPhone())
				.build();
	}

	@Override
	public void updateProfile(String customName, CarOwnerProfileModifyDTO dto) {
		CustomerEntity entity = customerRepository.findByCustomName(customName)
				.orElseThrow(()-> new RuntimeException("회원 정보를 찾을 수 없습니다."));
		
		entity.setCustomName(dto.getCustomName());
		entity.setPhone(dto.getPhone());
		entity.setNickname(dto.getNickname());
		entity.setUpdatedAt(LocalDateTime.now());
		
		customerRepository.save(entity);
		
	}

}
