package com.pms.backend.controller;

import com.pms.backend.dto.request.FormRequestDto;
import com.pms.backend.dto.request.SubmitFormRequestDto;
import com.pms.backend.dto.response.FormResponseDto;
import com.pms.backend.service.FormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    @PostMapping
    public ResponseEntity<FormResponseDto> createForm(@RequestBody FormRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(formService.createForm(request));
    }

    @PostMapping("/{formId}/submit")
    public ResponseEntity<String> submitForm(
            @PathVariable Long formId,
            @RequestBody SubmitFormRequestDto request) {

        formService.submitForm(formId, request);

        return ResponseEntity.ok("Form submitted successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormResponseDto> getForm(@PathVariable Long id) {
        return ResponseEntity.ok(formService.getFormById(id));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<?> getFormsByDrive(@PathVariable Long driveId) {
        return ResponseEntity.ok(formService.getFormsByDrive(driveId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormResponseDto> updateForm(
            @PathVariable Long id,
            @RequestBody FormRequestDto request) {

        return ResponseEntity.ok(formService.updateForm(id, request));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<String> publishForm(@PathVariable Long id) {
        formService.publishForm(id);
        return ResponseEntity.ok("Form published successfully");
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<String> closeForm(@PathVariable Long id) {
        formService.closeForm(id);
        return ResponseEntity.ok("Form closed successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteForm(@PathVariable Long id) {
        formService.deleteForm(id);
        return ResponseEntity.ok("Form deleted successfully");
    }
}