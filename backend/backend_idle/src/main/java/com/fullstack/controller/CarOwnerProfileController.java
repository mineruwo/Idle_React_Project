package com.fullstack.controller;


import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.service.CarOwnerProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/car-owner/profile")
@RequiredArgsConstructor
@Log4j2
public class CarOwnerProfileController {

    private final CarOwnerProfileService profileService;

    @GetMapping
    public CarOwnerProfileDTO get(@AuthenticationPrincipal String loginId) {
        System.out.println("[PROFILE] loginId(principal) = " + loginId);
        return profileService.getProfile(loginId);
    }
    
    @GetMapping("/me")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public CarOwnerProfileDTO getCurrentUser(@AuthenticationPrincipal String loginId) {
        log.info("[PROFILE] principal(loginId)={}", loginId);
        return profileService.getProfile(loginId);
    }

    @PutMapping
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public CarOwnerProfileDTO update(@AuthenticationPrincipal String loginId,
                                     @Valid @RequestBody CarOwnerProfileModifyDTO req) {
        return profileService.updateProfile(loginId, req);
    }

    @GetMapping("/availability/nickname")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public boolean nicknameAvailable(@AuthenticationPrincipal String loginId,
                                     @jakarta.validation.constraints.NotBlank
                                     @RequestParam("nickname") String nickname) {
        // 입력 정규화 권장: 공백 제거/정책 적용
        
        return profileService.isNicknameAvailable(loginId, nickname.trim());
        // 또는 Map.of("ok", result)로 응답 형태 고정 가능
    }
}