package com.fullstack.controller;

import com.fullstack.entity.Faq;
import com.fullstack.entity.Notice;
import com.fullstack.service.FaqService;
import com.fullstack.service.NoticeService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PublicController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private FaqService faqService;

    @GetMapping("/notices")
    public ResponseEntity<List<Notice>> getAllNotices() {
        List<Notice> notices = noticeService.getAllNotices();
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/faqs")
    public ResponseEntity<List<Faq>> getAllFAQs() {
        List<Faq> faqs = faqService.getAllFAQs();
        return ResponseEntity.ok(faqs);
    }
}

