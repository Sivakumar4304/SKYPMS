package com.pms.backend.repository;

import com.pms.backend.entity.FormResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FormResponseRepository extends JpaRepository<FormResponse, Long> {

    List<FormResponse> findByFormId(Long formId);

    List<FormResponse> findByStudentId(Long studentId);

    Optional<FormResponse> findByFormIdAndStudentId(Long formId, Long studentId);

}