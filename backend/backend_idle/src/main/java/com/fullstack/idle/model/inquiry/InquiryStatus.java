package com.fullstack.idle.model.inquiry;

public enum InquiryStatus {
    INQUIRY_PENDING, // 문의 대기 (최초, 디폴트)
    IN_PROGRESS,     // 답변 중 (관리자 선택 시)
    ANSWERED,        // 답변 완료 (답변 완료 시)
    RE_INQUIRY       // 재문의 (고객의 추가 문의 시)
}
