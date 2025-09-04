package com.fullstack.service;

import com.fullstack.entity.AdminEntity;
import com.fullstack.model.AdminDTO;
import com.fullstack.repository.AdminRepository;

import jakarta.persistence.criteria.Predicate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit; // Added import
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDTO getAdmin(String adminId) {
        Optional<AdminEntity> result = adminRepository.findByAdminIdAndIsDelFalse(adminId);
        return result.map(this::entityToDto).orElse(null);
    }

        @Override
    public AdminDTO getAdminById(Integer id) {
        Optional<AdminEntity> result = adminRepository.findById(id);
        return result.map(this::entityToDto).orElse(null);
    }

    @Override
    public AdminDTO createAdmin(AdminDTO adminDTO) {
        AdminEntity admin = dtoToEntity(adminDTO);
        admin.setPassword(passwordEncoder.encode(admin.getPassword())); // 비밀번호 암호화
        admin.setRegDate(LocalDateTime.now());
        AdminEntity savedAdmin = adminRepository.save(admin);
        return entityToDto(savedAdmin);
    }

    @Override
    public AdminDTO updateAdmin(Integer id, AdminDTO adminDTO) {
        Optional<AdminEntity> result = adminRepository.findById(id);
        if (result.isPresent()) {
            AdminEntity admin = result.get();
            admin.setName(adminDTO.getName());
            admin.setRole(adminDTO.getRole());
            // Password should be updated via a separate, dedicated process
            AdminEntity updatedAdmin = adminRepository.save(admin);
            return entityToDto(updatedAdmin);
        }
        return null; // Or throw a ResourceNotFoundException
    }

    @Override
    public void deleteAdmin(Integer id) {
        Optional<AdminEntity> result = adminRepository.findById(id);
        if (result.isPresent()) {
            AdminEntity admin = result.get();
            admin.setDel(true);
            admin.setDelDate(LocalDateTime.now());
            adminRepository.save(admin);
        }
        // Or throw an exception if not found
    }

    @Override
    public Page<AdminDTO> getAdminList(Pageable pageable, String role, String searchType, String searchQuery) {
        Specification<AdminEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Role filter
            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            // Search filter
            if (searchQuery != null && !searchQuery.isEmpty()) {
                switch (searchType) {
                    case "adminId":
                        predicates.add(cb.like(root.get("adminId"), "%" + searchQuery + "%"));
                        break;
                    case "name":
                        predicates.add(cb.like(root.get("name"), "%" + searchQuery + "%"));
                        break;
                    case "emplId":
                        predicates.add(cb.like(root.get("emplId"), "%" + searchQuery + "%"));
                        break;
                }
            }

            // No longer excluding deleted admins by default

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AdminEntity> adminPage = adminRepository.findAll(spec, pageable);
        return adminPage.map(this::entityToDto);
    }

    private LocalDateTime calculateDateTime(String dateRange) {
        LocalDateTime now = LocalDateTime.now();
        switch (dateRange) {
            case "1day":
                return now.minus(1, ChronoUnit.DAYS);
            case "1week":
                return now.minus(1, ChronoUnit.WEEKS);
            case "1month":
                return now.minus(1, ChronoUnit.MONTHS);
            default:
                return LocalDateTime.MIN; // No date filter
        }
    }

    @Override
    public Page<AdminDTO> getRecentlyCreatedAdmins(Pageable pageable, String dateRange) {
        LocalDateTime filterDateTime = calculateDateTime(dateRange);
        Specification<AdminEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDel")));
            predicates.add(cb.greaterThanOrEqualTo(root.get("regDate"), filterDateTime));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<AdminEntity> adminPage = adminRepository.findAll(spec, pageable);
        return adminPage.map(this::entityToDto);
    }

    @Override
    public Page<AdminDTO> getRecentlyDeletedAdmins(Pageable pageable, String dateRange) {
        LocalDateTime filterDateTime = calculateDateTime(dateRange);
        Specification<AdminEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isDel")));
            predicates.add(cb.greaterThanOrEqualTo(root.get("delDate"), filterDateTime));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<AdminEntity> adminPage = adminRepository.findAll(spec, pageable);
        return adminPage.map(this::entityToDto);
    }


    private AdminEntity dtoToEntity(AdminDTO adminDTO) {
        return AdminEntity.builder()
                .idIndex(adminDTO.getIdIndex())
                .adminId(adminDTO.getAdminId())
                .role(adminDTO.getRole())
                .password(adminDTO.getPassword())
                .name(adminDTO.getName())
                .emplId(adminDTO.getEmplId())
                .regDate(adminDTO.getRegDate())
                .delDate(adminDTO.getDelDate())
                .isDel(adminDTO.isDel())
                .build();
    }

    private AdminDTO entityToDto(AdminEntity admin) {
        return AdminDTO.builder()
                .idIndex(admin.getIdIndex())
                .adminId(admin.getAdminId())
                .role(admin.getRole())
                .password(admin.getPassword()) // 비밀번호는 DTO로 변환하지 않음
                .name(admin.getName())
                .emplId(admin.getEmplId())
                .regDate(admin.getRegDate())
                .delDate(admin.getDelDate())
                .isDel(admin.isDel())
                .build();
    }
}
