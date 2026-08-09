package com.pms.backend.dto.request;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitFormRequestDto {

    private Long studentId;

    // key = fieldId, value = answer
    private Map<Long, String> answers;
}