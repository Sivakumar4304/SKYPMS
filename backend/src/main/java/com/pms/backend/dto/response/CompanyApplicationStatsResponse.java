package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyApplicationStatsResponse {

    private String companyName;
    private long applicationCount;
}