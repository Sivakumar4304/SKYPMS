package com.pms.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {

    @NotBlank(message = "Company name cannot be blank")
    private String name;

    private String website;

    private String logo;

    private String description;

    private String location;
}