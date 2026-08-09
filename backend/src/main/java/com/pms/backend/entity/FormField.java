package com.pms.backend.entity;

import com.pms.backend.enums.FieldType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "form_fields")
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType fieldType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    private String placeholder;

    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(nullable = false)
    private Integer displayOrder;

    private String defaultValue;

    private String validationRegex;
}