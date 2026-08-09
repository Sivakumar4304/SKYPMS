package com.pms.backend.repository;

import com.pms.backend.entity.FormAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormAnswerRepository extends JpaRepository<FormAnswer, Long> {

    List<FormAnswer> findByFormResponseId(Long responseId);

}