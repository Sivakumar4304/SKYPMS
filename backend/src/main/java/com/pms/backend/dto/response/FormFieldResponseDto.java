package com.pms.backend.dto.response;

import com.pms.backend.enums.FieldType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormFieldResponseDto {

    private Long id;

    private String label;

    private FieldType fieldType;

    private Boolean required;

    private String placeholder;

    private String options;

    private Integer displayOrder;

    private String defaultValue;
}