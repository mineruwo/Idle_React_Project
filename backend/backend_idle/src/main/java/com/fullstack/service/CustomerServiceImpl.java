package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;

	// 로그인
	@Override
	public LoginResponseDTO login(CustomerDTO dto) {
		boolean valid = isAccountValid(dto.getId(), dto.getPasswordEnc());
		
		if (!valid) {
	        throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
	    }
		
		CustomerEntity entity = customerRepository.findById(dto.getId())
		        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
	
		return new LoginResponseDTO (
				entity.getId(),
				entity.getNickname(),
				entity.getRole(),
				entity.getIdNum()
		    );
	}
	
	// 회원가입
	@Override
	public void register(CustomerDTO dto) {
		// 비밀번호 암호화
		String rawPassword = dto.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		dto.setPasswordEnc(encodedPassword);

		CustomerEntity entity = dtoToEntity(dto);
		customerRepository.save(entity);
	}

	// 로그인 검증
	@Override
	public boolean isAccountValid(String id, String rawPassword) {
		Optional<CustomerEntity> result = customerRepository.findById(id);
		
		if (result.isEmpty()) {
			return false;
		}
		// 암호화된 비밀번호와 비교
		String encodedPassword = result.get().getPasswordEnc();
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

	// 회원가입 검증
	@Override
	public boolean isIdDuplicate(String id) {
		return customerRepository.existsById(id);
	}
	@Override
	public boolean isNicknameDuplicate(String nickname) {
		return customerRepository.existsByNickname(nickname);
	}

	private CustomerEntity dtoToEntity(CustomerDTO dto) {
		return CustomerEntity.builder().id(dto.getId()).passwordEnc(dto.getPasswordEnc())
				.customName(dto.getCustomName()).phone(dto.getPhone()).nickname(dto.getNickname()).role(dto.getRole())
				.createdAt(LocalDateTime.now()).isLefted(false).userPoint(0).build();
	}

	@Override
	public Page<CustomerEntity> getCustomers(Pageable pageable) {
		return customerRepository.findAll(pageable);
	}

	@Override
	public CustomerDTO createCustomer(CustomerDTO dto) {
		// 비밀번호 암호화
		String rawPassword = dto.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		dto.setPasswordEnc(encodedPassword);

		CustomerEntity entity = dtoToEntity(dto);
		System.out.println("CustomerEntity before save: " + entity);
		CustomerEntity savedEntity = customerRepository.save(entity);
		System.out.println("CustomerEntity after save: " + savedEntity);
		return entityToDto(savedEntity);
	}

	private CustomerDTO entityToDto(CustomerEntity entity) {
		CustomerDTO dto = new CustomerDTO();
		dto.setId(entity.getId());
		dto.setPasswordEnc(entity.getPasswordEnc());
		dto.setCustomName(entity.getCustomName());
		dto.setRole(entity.getRole());
		dto.setCreatedAt(entity.getCreatedAt());
		dto.setUpdatedAt(entity.getUpdatedAt());
		dto.setPhone(entity.getPhone());
		dto.setNickname(entity.getNickname());
		dto.setSnsLoginProvider(entity.getSnsLoginProvider());
		dto.setSnsProviderId(entity.getSnsProviderId());
		dto.setLeftedAt(entity.getLeftedAt());
		dto.setIsLefted(entity.getIsLefted());
		dto.setUserPoint(entity.getUserPoint());
		return dto;
	}

	@Override
	public Integer getPoints(String id) {
		CustomerEntity customerEntity = customerRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return customerEntity.getUserPoint();
	}

}
