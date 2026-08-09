package com.pms.backend.dto.response;

import com.pms.backend.enums.FormStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormResponseDto {

    private Long id;

    private String title;

    private String description;

    private FormStatus status;

    private Long placementDriveId;

    private List<FormFieldResponseDto> fields;
}