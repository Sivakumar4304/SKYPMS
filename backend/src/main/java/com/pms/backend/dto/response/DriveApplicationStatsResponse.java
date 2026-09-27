package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriveApplicationStatsResponse {

    private Long driveId;
    private String companyName;
    private long applicationCount;
}