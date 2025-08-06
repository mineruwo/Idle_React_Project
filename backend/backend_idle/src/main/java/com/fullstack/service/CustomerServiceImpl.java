package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;

	/*
	 * public List<CustomerDTO> getAllCustomers() { return
	 * customerRepository.findAll(); }
	 * 
	 * public Optional<CustomerDTO> getCustomerByIdNum(Integer idNum) { return
	 * customerRepository.findById(idNum); }
	 * 
	 * public CustomerDTO createCustomer(CustomerDTO customer) {
	 * customer.setCreatedAt(LocalDateTime.now()); customer.setIsLefted(false); //
	 * 기본값 설정 customer.setUserPoint(0); // 기본값 설정 return
	 * customerRepository.save(customer); }
	 * 
	 * public CustomerDTO updateCustomer(Integer idNum, CustomerDTO customerDetails)
	 * { CustomerDTO customer = customerRepository.findById(idNum) .orElseThrow(()
	 * -> new RuntimeException("Customer not found for this id :: " + idNum));
	 * 
	 * customer.setId(customerDetails.getId());
	 * customer.setPasswordEnc(customerDetails.getPasswordEnc());
	 * customer.setCustomName(customerDetails.getCustomName());
	 * customer.setRole(customerDetails.getRole());
	 * customer.setPhone(customerDetails.getPhone());
	 * customer.setNickname(customerDetails.getNickname());
	 * customer.setSnsLoginProvider(customerDetails.getSnsLoginProvider());
	 * customer.setSnsProviderId(customerDetails.getSnsProviderId());
	 * customer.setUpdatedAt(LocalDateTime.now()); // 업데이트 시간 설정
	 * 
	 * return customerRepository.save(customer); }
	 * 
	 * public void deleteCustomer(Integer idNum) { CustomerDTO customer =
	 * customerRepository.findById(idNum) .orElseThrow(() -> new
	 * RuntimeException("Customer not found for this id :: " + idNum));
	 * customerRepository.delete(customer); }
	 * 
	 * 
	 * public CustomerDTO getCustomerById(String id) { return
	 * customerRepository.findById(id); }
	 */

	@Override
	public void login(CustomerDTO dto) {
		boolean valid = isAccountValid(dto.getId(), dto.getPasswordEnc());
		
		if (!valid) {
	        throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
	    }

	    // 로그인 성공 후 처리할 것 있으면 여기에 (예: 로그 기록 등)
	}
	
	@Override
	public void register(CustomerDTO dto) {
		// 비밀번호 암호화
		String rawPassword = dto.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		dto.setPasswordEnc(encodedPassword);

		CustomerEntity entity = dtoToEntity(dto);
		customerRepository.save(entity);
	}

	@Override
	public boolean isAccountValid(String id, String rawPassword) {
		Optional<CustomerEntity> result = customerRepository.findById(id);
		
		System.out.println(">>>  " + rawPassword);
		System.out.println(">>> ID로 조회된 결과: " + result);
		
		if (result.isEmpty()) {
			return false;
		}
		// 암호화된 비밀번호와 비교
		String encodedPassword = result.get().getPasswordEnc();
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

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

}
