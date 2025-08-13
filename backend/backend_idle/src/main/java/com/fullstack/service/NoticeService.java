package com.fullstack.service;

import com.fullstack.entity.Notice;
import com.fullstack.model.NoticeDTO;
import com.fullstack.repository.NoticeRepository;
import java.util.List;

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
}
