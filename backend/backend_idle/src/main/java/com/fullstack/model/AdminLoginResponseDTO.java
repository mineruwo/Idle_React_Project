package com.fullstack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponseDTO {
    private String adminId;
    private String name;
    private String role;
    private Integer idIndex;

    public AdminLoginResponseDTO(AdminDTO adminDTO) {
        this.adminId = adminDTO.getAdminId();
        this.name = adminDTO.getName();
        this.role = adminDTO.getRole().name();
        this.idIndex = adminDTO.getIdIndex();
    }
}
