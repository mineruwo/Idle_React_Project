package com.fullstack.controller;


import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.service.CarOwnerProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/car-owner/profile")
@RequiredArgsConstructor
public class CarOwnerProfileController {

    private final CarOwnerProfileService profileService;

    @GetMapping
    public CarOwnerProfileDTO get(@AuthenticationPrincipal String loginId) {
        System.out.println("[PROFILE] loginId(principal) = " + loginId);
        return profileService.getProfile(loginId);
    }
    
    @GetMapping("/me")
    public CarOwnerProfileDTO getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
            || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED");
        }
        String userId = authentication.getName(); // JWTFilter에서 principal로 넣은 값
        return profileService.getProfile(userId);
    }

    @PutMapping
    public CarOwnerProfileDTO update(@AuthenticationPrincipal String loginId,
                                     @Valid @RequestBody CarOwnerProfileModifyDTO req) {
        return profileService.updateProfile(loginId, req);
    }

    @GetMapping("/availability/nickname")
    public boolean nicknameAvailable(@AuthenticationPrincipal String loginId,
                                     @RequestParam String nickname) {
        return profileService.isNicknameAvailable(loginId, nickname);
    }
}