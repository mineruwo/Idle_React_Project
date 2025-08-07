package com.fullstack.idle;

import com.fullstack.entity.Admin;
import com.fullstack.model.AdminDTO;
import com.fullstack.model.enums.Role;
import com.fullstack.repository.AdminRepository;
import com.fullstack.service.AdminService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

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
                .adminId("admin")
                .password("pwd1234")
                .name("개발 관리자")
                .role(Role.DEV_ADMIN)	
                .emplId("001")
                .build();

        // when
        adminService.createAdmin(adminDTO);
        System.out.println(adminDTO);
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
