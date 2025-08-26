package com.fullstack.service;

import com.fullstack.entity.Faq;
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

    public List<Faq> getAllFAQs() {
        return faqRepository.findAll();
    }

    public Faq getFaqById(Long faqId) {
        Optional<Faq> optionalFaq = faqRepository.findById(faqId);
        if (optionalFaq.isPresent()) {
            Faq faq = optionalFaq.get();
            faq.setViewCount(faq.getViewCount() + 1);
            return faqRepository.save(faq);
        } else {
            // Handle the case where the notice is not found
            return null;
        }
    }

    public Faq getFaqForEdit(Long faqId) {
        return faqRepository.findById(faqId).orElse(null);
    }

    public Faq createFAQ(FaqDTO faqDTO) {
        Faq faq = new Faq();
        faq.setQuestion(faqDTO.getQuestion());
        faq.setAnswer(faqDTO.getAnswer());
        faq.setWriterAdminId(faqDTO.getWriterAdminId());
        return faqRepository.save(faq);
    }

    public Faq updateFAQ(Long id, FaqDTO faqDTO) {
        Optional<Faq> optionalFaq = faqRepository.findById(id);
        if (optionalFaq.isPresent()) {
            Faq faq = optionalFaq.get();
            faq.setQuestion(faqDTO.getQuestion());
            faq.setAnswer(faqDTO.getAnswer());
            return faqRepository.save(faq);
        }
        return null;
    }

    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }

    public Faq toggleFAQActive(Long id) {
        Optional<Faq> optionalFaq = faqRepository.findById(id);
        if (optionalFaq.isPresent()) {
            Faq faq = optionalFaq.get();
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
