package com.pms.backend.repository;

import com.pms.backend.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormRepository extends JpaRepository<Form, Long> {

    List<Form> findByPlacementDriveId(Long driveId);

}