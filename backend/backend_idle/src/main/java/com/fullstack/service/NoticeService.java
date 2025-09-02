package com.fullstack.service;

import com.fullstack.entity.NoticeEntity;
import com.fullstack.model.NoticeDTO;
import com.fullstack.repository.NoticeRepository;
import com.fullstack.repository.AdminRepository; // Added
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private AdminRepository adminRepository; // Added

    public NoticeEntity createNotice(NoticeDTO noticeDTO) {
        NoticeEntity notice = new NoticeEntity();
        // Assuming ID is auto-generated, so not setting it here
        notice.setTitle(noticeDTO.getTitle());
        notice.setContent(noticeDTO.getContent());
        notice.setWriterAdmin(adminRepository.findByAdminId(noticeDTO.getWriterAdminId()).orElse(null));
        // createdAt, updatedAt, isDel are handled by @PrePersist in Notice entity
        return noticeRepository.save(notice);
    }

    public List<NoticeEntity> getAllNotices() {
        return noticeRepository.findAll();
    }
    
    public NoticeEntity getNoticeById(Long noticeId) {
        Optional<NoticeEntity> optionalNotice = noticeRepository.findById(noticeId);
        if (optionalNotice.isPresent()) {
            NoticeEntity notice = optionalNotice.get();
            notice.setViewCount(notice.getViewCount() + 1);
            return noticeRepository.save(notice);
        } else {
            // Handle the case where the notice is not found
            return null;
        }
    }

    public NoticeEntity getNoticeForEdit(Long noticeId) {
        return noticeRepository.findById(noticeId).orElse(null);
    }

    public NoticeEntity updateNotice(Long id, NoticeDTO noticeDTO) {
        Optional<NoticeEntity> optionalNotice = noticeRepository.findById(id);
        if (optionalNotice.isPresent()) {
            NoticeEntity notice = optionalNotice.get();
            notice.setTitle(noticeDTO.getTitle());
            notice.setContent(noticeDTO.getContent());
            return noticeRepository.save(notice);
        } else {
            return null;
        }
    }

    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    public NoticeEntity toggleNoticeActive(Long id) {
        Optional<NoticeEntity> optionalNotice = noticeRepository.findById(id);
        if (optionalNotice.isPresent()) {
            NoticeEntity notice = optionalNotice.get();
            notice.setIsDel(!notice.getIsDel());
            if (notice.getIsDel()) {
                notice.setDeletedAt(LocalDateTime.now());
            } else {
                notice.setDeletedAt(null);
            }
            return noticeRepository.save(notice);
        } else {
            return null;
        }
    }
}
