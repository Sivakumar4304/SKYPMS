package com.pms.backend.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormRequestDto {

    private String title;

    private String description;

    private Long placementDriveId;

    private List<FormFieldRequestDto> fields;
}