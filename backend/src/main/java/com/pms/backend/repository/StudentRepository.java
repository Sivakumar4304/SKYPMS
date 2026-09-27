package com.pms.backend.repository;

import com.pms.backend.entity.Student;
import com.pms.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

    public interface StudentRepository
            extends JpaRepository<Student, Long>,
        JpaSpecificationExecutor<Student> {

    Optional<Student> findByRollNumber(String rollNumber);

    boolean existsByRollNumber(String rollNumber);

    Optional<Student> findByUser(User user);

    List<Student> findByGraduationYear(Integer graduationYear);

    @Query("SELECT DISTINCT s.graduationYear FROM Student s ORDER BY s.graduationYear")
    List<Integer> findDistinctGraduationYears();

    @Query("SELECT COALESCE(AVG(s.cgpa), 0) FROM Student s")
    double findAverageCgpa();
}