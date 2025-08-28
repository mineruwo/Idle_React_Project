package com.fullstack.service;

import com.fullstack.entity.CustomerEntity;
import com.fullstack.model.CustomerDTO;
import com.fullstack.model.LoginResponseDTO;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.security.jwt.JWTUtil;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final PasswordEncoder passwordEncoder;

	// 로그인
	@Override
	public LoginResponseDTO login(CustomerDTO dto) {
		boolean valid = isAccountValid(dto.getId(), dto.getPasswordEnc());
		
		if (!valid) {
	        throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
	    }
		
		CustomerEntity entity = customerRepository.findById(dto.getId())
		        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
	
		return new LoginResponseDTO (
				entity.getId(),
				entity.getNickname(),
				entity.getRole(),
				entity.getIdNum()
		    );
	}
	
	// 회원가입
	@Override
	public void register(CustomerDTO dto) {
		// 비밀번호 암호화
		String rawPassword = dto.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		dto.setPasswordEnc(encodedPassword);

		CustomerEntity entity = dtoToEntity(dto);
		customerRepository.save(entity);
	}

	// 로그인 검증
	@Override
	public boolean isAccountValid(String id, String rawPassword) {
		Optional<CustomerEntity> result = customerRepository.findById(id);
		
		if (result.isEmpty()) {
			return false;
		}
		// 암호화된 비밀번호와 비교
		String encodedPassword = result.get().getPasswordEnc();
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}

	// 회원가입 검증
	@Override
	public boolean isIdDuplicate(String id) {
		return customerRepository.existsById(id);
	}
	@Override
	public boolean isNicknameDuplicate(String nickname) {
		return customerRepository.existsByNickname(nickname);
	}

	private CustomerEntity dtoToEntity(CustomerDTO dto) {
		return CustomerEntity.builder().id(dto.getId()).passwordEnc(dto.getPasswordEnc())
				.customName(dto.getCustomName()).phone(dto.getPhone()).nickname(dto.getNickname()).role(dto.getRole())
				.createdAt(LocalDateTime.now()).isLefted(false).userPoint(0).build();
	}

	@Override
    public Page<CustomerEntity> getCustomers(Pageable pageable, String role, String searchType, String searchQuery) {
        Specification<CustomerEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Role filter
            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(cb.upper(root.get("role")), role.toUpperCase()));
            }

            // Search filter
            if (searchQuery != null && !searchQuery.isEmpty()) {
                switch (searchType) {
                    case "id":
                        predicates.add(cb.like(root.get("id"), "%" + searchQuery + "%"));
                        break;
                    case "customName":
                        predicates.add(cb.like(root.get("customName"), "%" + searchQuery + "%"));
                        break;
                    case "phone": // Changed from 'contact' to 'phone' based on CustomerEntity
                        predicates.add(cb.like(root.get("phone"), "%" + searchQuery + "%"));
                        break;
                }
            }

            // Exclude lefted customers (assuming isLefted is a boolean field)
            predicates.add(cb.isFalse(root.get("isLefted")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CustomerEntity> customerPage = customerRepository.findAll(spec, pageable);
        return customerPage;
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
    public Page<CustomerDTO> getRecentlyCreatedCustomers(Pageable pageable, String dateRange) {
        LocalDateTime filterDateTime = calculateDateTime(dateRange);
        Specification<CustomerEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isLefted")));
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filterDateTime));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<CustomerEntity> customerPage = customerRepository.findAll(spec, pageable);
        return customerPage.map(this::entityToDto);
    }

    @Override
    public Page<CustomerDTO> getRecentlyDeletedCustomers(Pageable pageable, String dateRange) {
        LocalDateTime filterDateTime = calculateDateTime(dateRange);
        Specification<CustomerEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isLefted")));
            predicates.add(cb.greaterThanOrEqualTo(root.get("leftedAt"), filterDateTime));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<CustomerEntity> customerPage = customerRepository.findAll(spec, pageable);
        return customerPage.map(this::entityToDto);
    }

	@Override
    public Map<String, Long> getDailyCustomerCreationCounts(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        List<Object[]> results = customerRepository.countCustomersByCreationDate(startOfMonth, endOfMonth);

        Map<String, Long> dailyCounts = new LinkedHashMap<>();
        for (LocalDate date = startOfMonth; !date.isAfter(endOfMonth); date = date.plusDays(1)) {
            dailyCounts.put(date.toString(), 0L);
        }

        for (Object[] result : results) {
            LocalDate date = ((java.sql.Date) result[0]).toLocalDate(); // Fixed: Convert java.sql.Date to java.time.LocalDate
            Long count = (Long) result[1];
            dailyCounts.put(date.toString(), count);
        }
        return dailyCounts;
    }

    @Override
    public Map<String, Long> getDailyCustomerDeletionCounts(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        List<Object[]> results = customerRepository.countCustomersByDeletionDate(startOfMonth, endOfMonth);

        Map<String, Long> dailyCounts = new LinkedHashMap<>();
        for (LocalDate date = startOfMonth; !date.isAfter(endOfMonth); date = date.plusDays(1)) {
            dailyCounts.put(date.toString(), 0L);
        }

        for (Object[] result : results) {
            LocalDate date = ((java.sql.Date) result[0]).toLocalDate(); // Fixed: Convert java.sql.Date to java.time.LocalDate
            Long count = (Long) result[1];
            dailyCounts.put(date.toString(), count);
        }
        return dailyCounts;
    }

	@Override
	public CustomerDTO createCustomer(CustomerDTO dto) {
		// 비밀번호 암호화
		String rawPassword = dto.getPasswordEnc();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		dto.setPasswordEnc(encodedPassword);

		CustomerEntity entity = dtoToEntity(dto);
		System.out.println("CustomerEntity before save: " + entity);
		CustomerEntity savedEntity = customerRepository.save(entity);
		System.out.println("CustomerEntity after save: " + savedEntity);
		return entityToDto(savedEntity);
	}

    @Override
    public CustomerDTO getCustomerById(String id) {
        Optional<CustomerEntity> result = customerRepository.findById(id);
        return result.map(this::entityToDto).orElse(null);
    }

    @Override
    public CustomerDTO updateCustomer(String id, CustomerDTO customerDTO) {
        Optional<CustomerEntity> result = customerRepository.findById(id);
        if (result.isPresent()) {
            CustomerEntity customer = result.get();
            customer.setCustomName(customerDTO.getCustomName());
            customer.setPhone(customerDTO.getPhone());
            customer.setNickname(customerDTO.getNickname());
            customer.setRole(customerDTO.getRole());
            customer.setUpdatedAt(LocalDateTime.now());

            CustomerEntity updatedCustomer = customerRepository.save(customer);
            return entityToDto(updatedCustomer);
        }
        return null; // Or throw an exception
    }

    @Override
    public void deleteCustomer(String id) {
        Optional<CustomerEntity> result = customerRepository.findById(id);
        if (result.isPresent()) {
            CustomerEntity customer = result.get();
            customer.setIsLefted(true);
            customer.setLeftedAt(LocalDateTime.now());
            customerRepository.save(customer);
        }
        // Or throw an exception if not found
    }

	private CustomerDTO entityToDto(CustomerEntity entity) {
		CustomerDTO dto = new CustomerDTO();
		dto.setId(entity.getId());
		dto.setPasswordEnc(entity.getPasswordEnc());
		dto.setCustomName(entity.getCustomName());
		dto.setRole(entity.getRole());
		dto.setCreatedAt(entity.getCreatedAt());
		dto.setUpdatedAt(entity.getUpdatedAt());
		dto.setPhone(entity.getPhone());
		dto.setNickname(entity.getNickname());
		dto.setSnsLoginProvider(entity.getSnsLoginProvider());
		dto.setSnsProviderId(entity.getSnsProviderId());
		dto.setLeftedAt(entity.getLeftedAt());
		dto.setIsLefted(entity.getIsLefted());
		dto.setUserPoint(entity.getUserPoint());
		return dto;
	}

	@Override
	public Integer getPoints(String id) {
		CustomerEntity customerEntity = customerRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return customerEntity.getUserPoint();
	}

}