package com.fullstack.idle;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.fullstack.model.CustomerDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.service.CustomerService;

@SpringBootTest
public class SignupTest {

	@Autowired
	private CustomerRepository customerRepository;
	@Autowired
	private CustomerService customerService;


	@Test
	public void signupTest() throws Exception {
		CustomerDTO dto = new CustomerDTO();
		dto.setId("dongshin123");
        dto.setPasswordEnc("encodedPassword123!");
        dto.setCustomName("이동신");
        dto.setPhone("01012345678");
        dto.setNickname("idle");
        dto.setRole("SHIPPER");

        customerService.register(dto);
        System.out.println("회원가입 테스트 완료");
        
	}
}
