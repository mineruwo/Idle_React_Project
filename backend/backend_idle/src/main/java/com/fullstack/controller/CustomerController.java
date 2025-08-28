package com.fullstack.controller;

import com.fullstack.model.CustomerDTO;
import com.fullstack.model.SignupRequestDTO;
import com.fullstack.service.AuthService;
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
    private final AuthService authService;
    
    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequestDTO signupRequestDTO) {
    	authService.register(signupRequestDTO);
    	return ResponseEntity.ok().build();
    }
    
    // 아이디 중복 확인
    @GetMapping("/check-id")
    public ResponseEntity<Boolean> checkId(@RequestParam("id") String id) {
    	boolean result = authService.isIdDuplicate(id);
    	
    	return ResponseEntity.ok(result);
    }
    
    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
    	boolean result = authService.isNicknameDuplicate(nickname);
    	
    	return ResponseEntity.ok(result);
    }
    
    @GetMapping("/user/points")
    public ResponseEntity<Map<String, Integer>> getUserPoints(@AuthenticationPrincipal String id) {
    	Integer points = customerService.getPoints(id);
    	return ResponseEntity.ok(Map.of("points", points));
    }
}
