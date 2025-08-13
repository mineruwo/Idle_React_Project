package com.fullstack.idle;

import com.fullstack.entity.Admin;
import com.fullstack.model.AdminDTO;
import com.fullstack.model.enums.AdminRole;
import com.fullstack.repository.AdminRepository;
import com.fullstack.service.AdminService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AdminServiceTests {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

        @Test
    void testCreateAdmin() {
        // given
        String rawPassword = "pwd1234";
        AdminDTO adminDTO = AdminDTO.builder()
                .adminId("admin")
                .password(rawPassword)
                .name("개발 관리자")
                .role(AdminRole.DEV_ADMIN)	
                .emplId("001")
                .build();

        // when
        adminService.createAdmin(adminDTO);

        // then
        Admin foundAdminEntity = adminRepository.findByAdminIdAndIsDelFalse("admin").orElse(null);
        assertThat(foundAdminEntity).isNotNull();
        assertThat(passwordEncoder.matches(rawPassword, foundAdminEntity.getPassword())).isTrue();
        assertThat(foundAdminEntity.getName()).isEqualTo("개발 관리자");
        assertThat(foundAdminEntity.getRole()).isEqualTo(AdminRole.DEV_ADMIN);
        assertThat(foundAdminEntity.getEmplId()).isEqualTo("001");

        System.out.println(foundAdminEntity);
    }

    //@Test
    void testGetAdmin() {

        // when
        AdminDTO foundAdmin = adminService.getAdmin("admin");

        System.out.println(foundAdmin);
    }

   // @Test
    void testGetAdminList() {
        // when
       // List<AdminDTO> adminList = adminService.getAdminList();

       // System.out.println(adminList);
    }

   // @Test
    void testDeleteAdmin() {


        // when
       // adminService.deleteAdmin("admin");

        // then
        AdminDTO deletedAdmin = adminService.getAdmin("admin");
        assertThat(deletedAdmin).isNull();

        // isDel 플래그가 true로 설정되었는지 직접 확인
        Admin softDeletedAdmin = adminRepository.findAll().stream()
                .filter(a -> a.getAdminId().equals("admin"))
                .findFirst().orElse(null);
        assertThat(softDeletedAdmin).isNotNull();
        assertThat(softDeletedAdmin.isDel()).isTrue();
        assertThat(softDeletedAdmin.getDelDate()).isNotNull();
        
        System.out.println(softDeletedAdmin);
    }
}
