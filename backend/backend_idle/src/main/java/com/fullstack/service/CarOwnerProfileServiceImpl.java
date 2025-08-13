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
public class CarOwnerProfileServiceImpl implements CarOwnerProfileService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    @Override
    public CarOwnerProfileDTO getProfile(String loginId) {
        CustomerEntity c = customerRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalStateException("PROFILE_NOT_FOUND"));
        return toDTO(c);
    }

    @Transactional
    @Override
    public CarOwnerProfileDTO updateProfile(String loginId, CarOwnerProfileModifyDTO req) {
        CustomerEntity c = customerRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalStateException("PROFILE_NOT_FOUND"));

        if (req.getNickname() != null && !req.getNickname().isBlank()) {
            if (customerRepository.existsByNicknameAndLoginIdNot(req.getNickname(), loginId)) {
                throw new IllegalArgumentException("NICKNAME_ALREADY_IN_USE");
            }
        }

        if (req.getCustomName() != null) c.setCustomName(req.getCustomName());
        if (req.getNickname()   != null) c.setNickname(req.getNickname());
        if (req.getPhone()      != null) c.setPhone(req.getPhone());

        // CustomerEntity에 avatarUrl 컬럼이 아직 없으므로 주석 처리 또는 컬럼 추가 후 사용
        // if (req.getAvatarUrl() != null) c.setAvatarUrl(req.getAvatarUrl());

        c.setUpdatedAt(LocalDateTime.now());
        return toDTO(c);
    }

    @Transactional(readOnly = true)
    @Override
    public boolean isNicknameAvailable(String loginId, String nickname) {
        if (nickname == null || nickname.isBlank()) return false;
        return !customerRepository.existsByNicknameAndLoginIdNot(nickname, loginId);
    }

    private CarOwnerProfileDTO toDTO(CustomerEntity c) {
        return CarOwnerProfileDTO.builder()
                .loginId(c.getId())            // 로그인 아이디
                .customerId(c.getIdNum())      // PK (필요시)
                .customName(c.getCustomName())
                .nickname(c.getNickname())
                .phone(c.getPhone())
                .avatarUrl(null)               // 컬럼 추가 전까지 null
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
