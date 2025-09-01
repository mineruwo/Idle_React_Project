package com.fullstack.service;

import com.fullstack.entity.FaqEntity;
import com.fullstack.model.FaqDTO;
import com.fullstack.repository.FaqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FaqService {

    @Autowired
    private FaqRepository faqRepository;

    public List<FaqEntity> getAllFAQs() {
        return faqRepository.findAll();
    }

    public FaqEntity getFaqById(Long faqId) {
        Optional<FaqEntity> optionalFaq = faqRepository.findById(faqId);
        if (optionalFaq.isPresent()) {
            FaqEntity faq = optionalFaq.get();
            faq.setViewCount(faq.getViewCount() + 1);
            return faqRepository.save(faq);
        } else {
            // Handle the case where the notice is not found
            return null;
        }
    }

    public FaqEntity getFaqForEdit(Long faqId) {
        return faqRepository.findById(faqId).orElse(null);
    }

    public FaqEntity createFAQ(FaqDTO faqDTO) {
        FaqEntity faq = new FaqEntity();
        faq.setQuestion(faqDTO.getQuestion());
        faq.setAnswer(faqDTO.getAnswer());
        faq.setWriterAdminId(faqDTO.getWriterAdminId());
        return faqRepository.save(faq);
    }

    public FaqEntity updateFAQ(Long id, FaqDTO faqDTO) {
        Optional<FaqEntity> optionalFaq = faqRepository.findById(id);
        if (optionalFaq.isPresent()) {
            FaqEntity faq = optionalFaq.get();
            faq.setQuestion(faqDTO.getQuestion());
            faq.setAnswer(faqDTO.getAnswer());
            return faqRepository.save(faq);
        }
        return null;
    }

    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }

    public FaqEntity toggleFAQActive(Long id) {
        Optional<FaqEntity> optionalFaq = faqRepository.findById(id);
        if (optionalFaq.isPresent()) {
            FaqEntity faq = optionalFaq.get();
            faq.setIsDel(!faq.getIsDel());
            if (faq.getIsDel()) {
                faq.setDeletedAt(LocalDateTime.now());
            } else {
                faq.setDeletedAt(null);
            }
            return faqRepository.save(faq);
        }
        return null;
    }
}
