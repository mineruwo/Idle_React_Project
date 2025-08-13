package com.fullstack.controller;

import com.fullstack.model.CustomerDTO;
import com.fullstack.service.CustomerService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private final CustomerService customerService;
    
    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody CustomerDTO customerDTO) {
    	customerService.register(customerDTO);
    	return ResponseEntity.ok("회원가입 성공");
    }
    
    // 로그인 검사
    @PostMapping("/check-account")
    public ResponseEntity<Boolean> checkAccount(@RequestBody CustomerDTO customerDTO) {
    	boolean result = customerService.isAccountValid(customerDTO.getId(), customerDTO.getPasswordEnc());
    	
    	return ResponseEntity.ok(result);
    }
    
    // 아이디 중복 확인
    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkId(@RequestParam("id") String id) {
    	boolean result = customerService.isIdDuplicate(id);
    	
    	return ResponseEntity.ok(result);
    }
    
    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
    	boolean result = customerService.isNicknameDuplicate(nickname);
    	
    	return ResponseEntity.ok(result);
    }
    
    @GetMapping("/user/points")
    public ResponseEntity<Map<String, Integer>> getUserPoints(@AuthenticationPrincipal String id) {
    	Integer points = customerService.getPoints(id);
    	return ResponseEntity.ok(Map.of("points", points));
    }
}
