package com.fullstack.idle;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.service.CustomerService;

@SpringBootTest
public class SignupTest {

	@Autowired
	private CustomerRepository customerRepository;
	@Autowired
	private CustomerService customerService;

	// @Test
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

	@Test
	public void check_id() {
		/*
		 * CustomerEntity m = new CustomerEntity(); m.setUsername("dongshin123");
		 * m.setNickname("idle"); customerRepository.save(m);
		 */
		boolean userDup = customerService.isIdDuplicate("dongshin123");
		boolean nickDup = customerService.isNicknameDuplicate("idle");
		boolean userOk = customerService.isIdDuplicate("another");
		boolean nickOk = customerService.isNicknameDuplicate("another");

		// 콘솔 출력
		String testId1 = "dongshin123";
		String testNick1 = "idle";

		String testId2 = "another";
		String testNick2 = "another";

		System.out.println("==== 중복 검사 결과 ====");
		System.out.println("아이디 '" + testId1 + "' 중복 여부: " + userDup);
		System.out.println("닉네임 '" + testNick1 + "' 중복 여부: " + nickDup);
		System.out.println("아이디 '" + testId2 + "' 중복 여부: " + userOk);
		System.out.println("닉네임 '" + testNick2 + "' 중복 여부: " + nickOk);

		// then
		assertThat(userDup).isTrue();
		assertThat(nickDup).isTrue();
		assertThat(userOk).isFalse();
		assertThat(nickOk).isFalse();

	}
}
