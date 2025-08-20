package com.fullstack.service;

import com.fullstack.entity.Notice;
import com.fullstack.model.NoticeDTO;
import com.fullstack.repository.NoticeRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    public Notice createNotice(NoticeDTO noticeDTO) {
        Notice notice = new Notice();
        // Assuming ID is auto-generated, so not setting it here
        notice.setTitle(noticeDTO.getTitle());
        notice.setContent(noticeDTO.getContent());
        notice.setWriterAdminId(noticeDTO.getWriterAdminId());
        // createdAt, updatedAt, isDel are handled by @PrePersist in Notice entity
        return noticeRepository.save(notice);
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }
    
    public Notice getNoticeById(Long noticeId) {
        Optional<Notice> optionalNotice = noticeRepository.findById(noticeId);
        if (optionalNotice.isPresent()) {
            Notice notice = optionalNotice.get();
            notice.setViewCount(notice.getViewCount() + 1);
            return noticeRepository.save(notice);
        } else {
            // Handle the case where the notice is not found
            return null;
        }
    }
}
