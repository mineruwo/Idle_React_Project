package com.fullstack.controller;

import com.fullstack.model.CustomerDTO;
import com.fullstack.service.CustomerService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private final CustomerService customerService;
    
    /*
    @GetMapping
    public List<CustomerDTO> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{idNum}")
    public ResponseEntity<CustomerDTO> getCustomerByIdNum(@PathVariable Integer idNum) {
        Optional<CustomerDTO> customer = customerService.getCustomerByIdNum(idNum);
        return customer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public CustomerDTO createCustomer(@RequestBody CustomerDTO customer) {
        return customerService.createCustomer(customer);
    }

    @PutMapping("/{idNum}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Integer idNum, @RequestBody CustomerDTO customerDetails) {
        try {
            CustomerDTO updatedCustomer = customerService.updateCustomer(idNum, customerDetails);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idNum}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer idNum) {
        try {
            customerService.deleteCustomer(idNum);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-id/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable String id) {
        CustomerDTO customer = customerService.getCustomerById(id);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    */
    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody CustomerDTO customerDTO) {
    	customerService.login(customerDTO);
    	return ResponseEntity.ok("로그인 성공");
    }
    
    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody CustomerDTO customerDTO) {
    	customerService.register(customerDTO);
    	return ResponseEntity.ok("회원가입 성공");
    }
    
    // 로그인 검사
    @PostMapping("/check-account")
    public ResponseEntity<Boolean> checkAccount(@RequestBody CustomerDTO customerDTO) {
    	System.out.println(">>> 컨트롤러 도착");
        System.out.println(">>> ID: " + customerDTO.getId());
        System.out.println(">>> Password: " + customerDTO.getPasswordEnc());
    	
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
}
