package com.fullstack.controller;


import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.service.CarOwnerProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/car-owner/profile")
@RequiredArgsConstructor
public class CarOwnerProfileController {

    private final CarOwnerProfileService profileService;

    @GetMapping
    public CarOwnerProfileDTO get(@AuthenticationPrincipal String ownerId) {
        return profileService.getProfile(ownerId);
    }
    
    @PutMapping
    public CarOwnerProfileDTO update(
            @AuthenticationPrincipal String ownerId,
            @Valid @RequestBody CarOwnerProfileModifyDTO req
    ) {
        return profileService.updateProfile(ownerId, req);
    }


    @GetMapping("/availability/nickname")
    public boolean nicknameAvailable(@AuthenticationPrincipal String ownerId,
                                     @RequestParam String nickname) {
        return profileService.isNicknameAvailable(ownerId, nickname);
    }
}