package com.pms.backend.repository;

import com.pms.backend.entity.FormField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormFieldRepository extends JpaRepository<FormField, Long> {

    List<FormField> findByFormIdOrderByDisplayOrder(Long formId);

}