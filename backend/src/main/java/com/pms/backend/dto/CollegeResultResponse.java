package com.pms.backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeResultResponse {

    private Double cgpa;

    private Integer totalBacklogs;

    private List<Double> sgpas;
}