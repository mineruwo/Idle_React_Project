package com.fullstack.controller;

import com.fullstack.service.CarOwnerFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class CarOwnerAvatarController {

    private final CarOwnerFileStorageService fileStorageService;

    @PostMapping("/avatar")
    public String uploadAvatar(@AuthenticationPrincipal String ownerId,
                               @RequestParam("file") MultipartFile file) {
        return fileStorageService.storeAvatar(ownerId, file); // "/uploads/avatars/xxx.jpg"
    }
}
