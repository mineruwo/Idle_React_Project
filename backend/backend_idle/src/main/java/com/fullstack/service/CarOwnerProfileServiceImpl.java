package com.fullstack.service;


import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.service.CarOwnerProfileServiceImpl;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CarOwnerProfileServiceImpl implements CarOwnerProfileService{

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public CarOwnerProfileDTO getProfile(String ownerId) {
        CustomerEntity c = customerRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("PROFILE_NOT_FOUND"));
        return toDTO(c);
    }

    @Transactional
    public CarOwnerProfileDTO updateProfile(String ownerId, CarOwnerProfileModifyDTO req) {
        CustomerEntity c = customerRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalStateException("PROFILE_NOT_FOUND"));

        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            if (customerRepository.existsByNicknameAndIdNot(req.getNickname(), ownerId)) {
                throw new IllegalArgumentException("NICKNAME_ALREADY_IN_USE");
            }
        }

        if (req.getCustomName() != null) c.setCustomName(req.getCustomName());
        if (req.getNickname() != null)   c.setNickname(req.getNickname());
        if (req.getPhone() != null)      c.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null)  c.setAvatarUrl(req.getAvatarUrl()); // ← 추가

        c.setUpdatedAt(LocalDateTime.now());
        return toDTO(c);
    }

    @Transactional(readOnly = true)
    public boolean isNicknameAvailable(String ownerId, String nickname) {
        if (nickname == null || nickname.isBlank()) return false;
        return !customerRepository.existsByNicknameAndIdNot(nickname, ownerId);
    }

    private CarOwnerProfileDTO toDTO(CustomerEntity c) {
        return CarOwnerProfileDTO.builder()
                .ownerId(c.getId())
                .customName(c.getCustomName())
                .nickname(c.getNickname())
                .phone(c.getPhone())
                .avatarUrl(c.getAvatarUrl()) // ← 포함
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
