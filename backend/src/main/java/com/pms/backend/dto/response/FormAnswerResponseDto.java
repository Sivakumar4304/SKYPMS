package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormAnswerResponseDto {

    private Long fieldId;

    private String label;

    private String answer;
}