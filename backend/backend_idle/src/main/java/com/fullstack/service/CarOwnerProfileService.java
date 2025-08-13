package com.fullstack.service;





import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.fullstack.model.CarOwnerProfileDTO;
import com.fullstack.model.CarOwnerProfileModifyDTO;

public interface CarOwnerProfileService {

    /**
     * ownerId(로그인 사용자의 식별자)로 프로필 조회
     */
     CarOwnerProfileDTO getProfile( String loginId);

    /**
     * 닉네임 사용 가능 여부 확인 (본인 제외 중복 체크)
     */
    boolean isNicknameAvailable(String loginId, String nickname);
    
    /**
     * 프로필 수정 (닉네임 중복 검사 포함)
     */
    CarOwnerProfileDTO updateProfile(String loginId, CarOwnerProfileModifyDTO req);
}