package com.fullstack.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.LoginRequestDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.model.SignupRequestDTO;
import com.fullstack.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;

	// 로그인 검증
	@Override
	public LoginResponseDTO authenticate(LoginRequestDTO loginRequestDTO) {
		CustomerEntity customer = customerRepository.findById(loginRequestDTO.getId()).orElse(null);

		if (customer == null) {
			throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
		}

		// 암호화된 비밀번호와 비교
		String encodedPassword = customer.getPasswordEnc();
		String rawPassword = loginRequestDTO.getPasswordEnc();

		if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
			throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
		}

		return new LoginResponseDTO(customer.getId(), customer.getNickname(), customer.getRole(), customer.getIdNum());
	}

	// 회원가입
	@Override
	public void register(SignupRequestDTO signupRequestDTO) {
		// 비밀번호 암호화
		String rawPassword = signupRequestDTO.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		signupRequestDTO.setPasswordEnc(encodedPassword);
		
		CustomerEntity customer = CustomerEntity.builder()
				.id(signupRequestDTO.getId())
				.passwordEnc(signupRequestDTO.getPasswordEnc())
				.customName(signupRequestDTO.getCustomName())
				.phone(signupRequestDTO.getPhone())
				.nickname(signupRequestDTO.getNickname())
				.role(signupRequestDTO.getRole())
				.createdAt(LocalDateTime.now())
				.isLefted(false)
				.userPoint(0)
				.build();
		
		customerRepository.save(customer);
	}

	@Override
	public boolean isIdDuplicate(String id) {
		return customerRepository.existsById(id);
	}

	@Override
	public boolean isNicknameDuplicate(String nickname) {
		return customerRepository.existsByNickname(nickname);
	}
}
