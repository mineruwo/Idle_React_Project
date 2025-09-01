package com.fullstack;

import com.fullstack.entity.AdminEntity;
import com.fullstack.model.enums.AdminRole;
import com.fullstack.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@SpringBootApplication
@ComponentScan(basePackages = {"com.fullstack", "com.idle.backend.websocket"})
public class BackendIdleApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendIdleApplication.class, args);
	}
	
	@Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // 애플리케이션 시작 시 기본 관리자 계정 생성
    @Bean
    public CommandLineRunner initData(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.findByAdminIdAndIsDelFalse("admin").isEmpty()) {
                AdminEntity admin = AdminEntity.builder()
                        .adminId("admin")
                        .password(passwordEncoder.encode("admin1234")) // 안전한 비밀번호로 변경 권장
                        .name("기본 관리자")
                        .role(AdminRole.ALL_PERMISSION) // 모든 권한 부여
                        .emplId("EMP001")
                        .regDate(LocalDateTime.now())
                        .isDel(false)
                        .build();
                adminRepository.save(admin);
                System.out.println("기본 관리자 계정 생성: admin/admin1234");
            }
        };
    }
}