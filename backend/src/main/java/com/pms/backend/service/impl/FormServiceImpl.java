package com.pms.backend.service.impl;

import com.pms.backend.dto.request.FormFieldRequestDto;
import com.pms.backend.dto.request.FormRequestDto;
import com.pms.backend.dto.request.SubmitFormRequestDto;
import com.pms.backend.dto.response.FormResponseDto;
import com.pms.backend.dto.response.FormFieldResponseDto;
import com.pms.backend.entity.*;
import com.pms.backend.enums.FormStatus;
import com.pms.backend.repository.*;
import com.pms.backend.service.ApplicationService;
import com.pms.backend.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class FormServiceImpl implements FormService {

    private final FormRepository formRepository;
    private final FormFieldRepository formFieldRepository;
    private final FormResponseRepository formResponseRepository;
    private final FormAnswerRepository formAnswerRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final StudentRepository studentRepository;

    // Connect dynamic form submission to Application system
    private final ApplicationService applicationService;


    // =========================================================
    // CREATE FORM
    // =========================================================

    @Override
    public FormResponseDto createForm(FormRequestDto request) {

        PlacementDrive drive = placementDriveRepository.findById(
                request.getPlacementDriveId()
        ).orElseThrow(() ->
                new RuntimeException("Placement Drive not found")
        );

        Form form = Form.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .placementDrive(drive)
                .build();

        Form savedForm = formRepository.save(form);

        if (request.getFields() != null) {

            for (FormFieldRequestDto fieldDto : request.getFields()) {

                FormField field = FormField.builder()
                        .form(savedForm)
                        .label(fieldDto.getLabel())
                        .fieldType(fieldDto.getFieldType())
                        .required(
                                fieldDto.getRequired() != null
                                        ? fieldDto.getRequired()
                                        : false
                        )
                        .placeholder(fieldDto.getPlaceholder())
                        .options(fieldDto.getOptions())
                        .displayOrder(fieldDto.getDisplayOrder())
                        .defaultValue(fieldDto.getDefaultValue())
                        .validationRegex(fieldDto.getValidationRegex())
                        .build();

                formFieldRepository.save(field);
            }
        }

        return toResponse(savedForm);
    }


    // =========================================================
    // GET FORM
    // =========================================================

    @Override
    public FormResponseDto getFormById(Long formId) {

        Form form = getForm(formId);

        return toResponse(form);
    }


    // =========================================================
    // GET FORMS BY DRIVE
    // =========================================================

    @Override
    public List<FormResponseDto> getFormsByDrive(Long driveId) {

        return formRepository
                .findByPlacementDriveId(driveId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // UPDATE FORM
    // =========================================================

    @Override
    public FormResponseDto updateForm(
            Long formId,
            FormRequestDto request
    ) {

        Form form = getForm(formId);

        if (form.getStatus() != FormStatus.DRAFT) {
            throw new RuntimeException(
                    "Only draft forms can be edited"
            );
        }

        PlacementDrive drive = placementDriveRepository.findById(
                request.getPlacementDriveId()
        ).orElseThrow(() ->
                new RuntimeException("Placement Drive not found")
        );

        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setPlacementDrive(drive);
        form.setUpdatedAt(LocalDateTime.now());

        // Remove old fields
        formFieldRepository.deleteAll(
                formFieldRepository.findByFormIdOrderByDisplayOrder(formId)
        );

        // Add new fields
        if (request.getFields() != null) {

            for (FormFieldRequestDto fieldDto : request.getFields()) {

                FormField field = FormField.builder()
                        .form(form)
                        .label(fieldDto.getLabel())
                        .fieldType(fieldDto.getFieldType())
                        .required(
                                fieldDto.getRequired() != null
                                        ? fieldDto.getRequired()
                                        : false
                        )
                        .placeholder(fieldDto.getPlaceholder())
                        .options(fieldDto.getOptions())
                        .displayOrder(fieldDto.getDisplayOrder())
                        .defaultValue(fieldDto.getDefaultValue())
                        .validationRegex(fieldDto.getValidationRegex())
                        .build();

                formFieldRepository.save(field);
            }
        }

        return toResponse(formRepository.save(form));
    }


    // =========================================================
    // PUBLISH
    // =========================================================

    @Override
    public void publishForm(Long formId) {

        Form form = getForm(formId);

        form.setStatus(FormStatus.PUBLISHED);
        form.setUpdatedAt(LocalDateTime.now());

        formRepository.save(form);
    }


    // =========================================================
    // CLOSE
    // =========================================================

    @Override
    public void closeForm(Long formId) {

        Form form = getForm(formId);

        form.setStatus(FormStatus.CLOSED);
        form.setUpdatedAt(LocalDateTime.now());

        formRepository.save(form);
    }


    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteForm(Long formId) {

        Form form = getForm(formId);

        formRepository.delete(form);
    }


    // =========================================================
    // SUBMIT FORM
    // =========================================================

    @Override
    public void submitForm(
            Long formId,
            SubmitFormRequestDto request
    ) {

        Form form = getForm(formId);

        // Student can submit only published forms
        if (form.getStatus() != FormStatus.PUBLISHED) {
            throw new RuntimeException(
                    "This form is not available for submission"
            );
        }

        // Find student
        Student student = studentRepository.findById(
                request.getStudentId()
        ).orElseThrow(() ->
                new RuntimeException("Student not found")
        );

        // Prevent duplicate form submission
        if (formResponseRepository
                .findByFormIdAndStudentId(formId, student.getId())
                .isPresent()) {

            throw new RuntimeException(
                    "You have already submitted this form"
            );
        }

        // Create form response
        FormResponse response = FormResponse.builder()
                .form(form)
                .student(student)
                .submittedAt(LocalDateTime.now())
                .build();

        FormResponse savedResponse =
                formResponseRepository.save(response);


        // Save individual answers
        Map<Long, String> answers = request.getAnswers();

        if (answers != null) {

            for (Map.Entry<Long, String> entry : answers.entrySet()) {

                Long fieldId = entry.getKey();
                String answer = entry.getValue();

                FormField field = formFieldRepository
                        .findById(fieldId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Form field not found: " + fieldId
                                )
                        );

                FormAnswer formAnswer = FormAnswer.builder()
                        .formResponse(savedResponse)
                        .formField(field)
                        .answer(answer)
                        .build();

                formAnswerRepository.save(formAnswer);
            }
        }


        // =====================================================
        // IMPORTANT:
        // Create normal Application record
        // =====================================================

        applicationService.applyForDrive(
                student.getId(),
                form.getPlacementDrive().getId()
        );
    }


    // =========================================================
    // HELPER
    // =========================================================

    private Form getForm(Long formId) {

        return formRepository.findById(formId)
                .orElseThrow(() ->
                        new RuntimeException("Form not found")
                );
    }


    private FormResponseDto toResponse(Form form) {

        List<FormFieldResponseDto> fields =
                formFieldRepository
                        .findByFormIdOrderByDisplayOrder(form.getId())
                        .stream()
                        .map(field ->
                                FormFieldResponseDto.builder()
                                        .id(field.getId())
                                        .label(field.getLabel())
                                        .fieldType(field.getFieldType())
                                        .required(field.getRequired())
                                        .placeholder(field.getPlaceholder())
                                        .options(field.getOptions())
                                        .displayOrder(field.getDisplayOrder())
                                        .defaultValue(field.getDefaultValue())
                                        .build()
                        )
                        .toList();

        return FormResponseDto.builder()
                .id(form.getId())
                .title(form.getTitle())
                .description(form.getDescription())
                .status(form.getStatus())
                .placementDriveId(
                        form.getPlacementDrive().getId()
                )
                .fields(fields)
                .build();
    }
}