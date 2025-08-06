package com.fullstack.idle;

import com.fullstack.entity.Admin;
import com.fullstack.model.AdminDTO;
import com.fullstack.repository.AdminRepository;
import com.fullstack.service.AdminService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AdminServiceTests {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Test
    void testCreateAdmin() {
        // given
        AdminDTO adminDTO = AdminDTO.builder()
                .adminId("testAdmin")
                .password("password")
                .name("Test Admin")
                .role("ROLE_ADMIN")
                .emplId("EMP123")
                .build();

        // when
        adminService.createAdmin(adminDTO);

        // then
        AdminDTO foundAdmin = adminService.getAdmin("testAdmin");
        assertThat(foundAdmin).isNotNull();
        assertThat(foundAdmin.getName()).isEqualTo("Test Admin");
        assertThat(foundAdmin.getRegDate()).isNotNull();
        assertThat(foundAdmin.isDel()).isFalse();
    }

    @Test
    void testGetAdmin() {
        // given
        AdminDTO adminDTO = AdminDTO.builder()
                .adminId("testAdmin")
                .password("password")
                .name("Test Admin")
                .role("ROLE_ADMIN")
                .emplId("EMP123")
                .build();
        adminService.createAdmin(adminDTO);

        // when
        AdminDTO foundAdmin = adminService.getAdmin("testAdmin");

        // then
        assertThat(foundAdmin).isNotNull();
        assertThat(foundAdmin.getAdminId()).isEqualTo("testAdmin");
    }

    @Test
    void testGetAdminList() {
        // given
        AdminDTO admin1 = AdminDTO.builder().adminId("admin1").password("pass1").name("Admin One").role("ROLE_ADMIN").emplId("E001").build();
        AdminDTO admin2 = AdminDTO.builder().adminId("admin2").password("pass2").name("Admin Two").role("ROLE_ADMIN").emplId("E002").build();
        adminService.createAdmin(admin1);
        adminService.createAdmin(admin2);

        // when
        List<AdminDTO> adminList = adminService.getAdminList();

        // then
        assertThat(adminList).isNotNull();
        assertThat(adminList.size()).isEqualTo(2);
    }

    @Test
    void testDeleteAdmin() {
        // given
        AdminDTO adminDTO = AdminDTO.builder()
                .adminId("deleteAdmin")
                .password("password")
                .name("Delete Admin")
                .role("ROLE_ADMIN")
                .emplId("EMP456")
                .build();
        adminService.createAdmin(adminDTO);

        // when
        adminService.deleteAdmin("deleteAdmin");

        // then
        AdminDTO deletedAdmin = adminService.getAdmin("deleteAdmin");
        assertThat(deletedAdmin).isNull();

        // isDel 플래그가 true로 설정되었는지 직접 확인
        Admin softDeletedAdmin = adminRepository.findAll().stream()
                .filter(a -> a.getAdminId().equals("deleteAdmin"))
                .findFirst().orElse(null);
        assertThat(softDeletedAdmin).isNotNull();
        assertThat(softDeletedAdmin.isDel()).isTrue();
        assertThat(softDeletedAdmin.getDelDate()).isNotNull();
    }
}
