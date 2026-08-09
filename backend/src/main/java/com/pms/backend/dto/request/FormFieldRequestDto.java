package com.pms.backend.dto.request;

import com.pms.backend.enums.FieldType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormFieldRequestDto {

    private String label;

    private FieldType fieldType;

    private Boolean required;

    private String placeholder;

    private String options;

    private Integer displayOrder;

    private String defaultValue;

    private String validationRegex;
}