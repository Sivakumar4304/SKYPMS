package com.pms.backend.specification;

import com.pms.backend.entity.Application;
import com.pms.backend.entity.Skill;
import com.pms.backend.entity.Student;
import com.pms.backend.enums.ApplicationStatus;
import com.pms.backend.enums.Branch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class StudentSpecification {

    public static Specification<Student> filterStudents(
            String search,
            Branch branch,
            Double minCgpa,
            Double maxCgpa,
            String skill,
            Boolean placed,
            Integer graduationYear
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Search: name, email, roll number
            if (search != null && !search.trim().isEmpty()) {

                String searchValue =
                        "%" + search.trim().toLowerCase() + "%";

                Join<Student, com.pms.backend.entity.User> user =
                        root.join("user", JoinType.INNER);

                Predicate firstName =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        user.get("firstName")
                                ),
                                searchValue
                        );

                Predicate lastName =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        user.get("lastName")
                                ),
                                searchValue
                        );

                Predicate email =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        user.get("email")
                                ),
                                searchValue
                        );

                Predicate rollNumber =
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.get("rollNumber")
                                ),
                                searchValue
                        );

                predicates.add(
                        criteriaBuilder.or(
                                firstName,
                                lastName,
                                email,
                                rollNumber
                        )
                );
            }

            // Branch
            if (branch != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("branch"),
                                branch
                        )
                );
            }

            // Minimum CGPA
            if (minCgpa != null) {
                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("cgpa"),
                                minCgpa
                        )
                );
            }

            // Maximum CGPA
            if (maxCgpa != null) {
                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("cgpa"),
                                maxCgpa
                        )
                );
            }

            // Graduation year
            if (graduationYear != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("graduationYear"),
                                graduationYear
                        )
                );
            }

            // Skill
            if (skill != null && !skill.trim().isEmpty()) {

                Join<Student, Skill> skills =
                        root.join("skills", JoinType.INNER);

                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(
                                        skills.get("name")
                                ),
                                skill.trim().toLowerCase()
                        )
                );

                query.distinct(true);
            }

            // Placed / Unplaced
            if (placed != null) {

                var subquery = query.subquery(Long.class);

                var applicationRoot =
                        subquery.from(Application.class);

                subquery.select(
                        criteriaBuilder.count(applicationRoot)
                );

                subquery.where(
                        criteriaBuilder.equal(
                                applicationRoot.get("student"),
                                root
                        ),
                        criteriaBuilder.equal(
                                applicationRoot.get("status"),
                                ApplicationStatus.OFFERED
                        )
                );

                if (placed) {

                    // Student has at least one OFFERED application
                    predicates.add(
                            criteriaBuilder.greaterThan(
                                    subquery,
                                    0L
                            )
                    );

                } else {

                    // Student has no OFFERED application
                    predicates.add(
                            criteriaBuilder.equal(
                                    subquery,
                                    0L
                            )
                    );
                }
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}