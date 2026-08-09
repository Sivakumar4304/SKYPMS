package com.pms.backend.service;

import com.pms.backend.dto.request.FormRequestDto;
import com.pms.backend.dto.request.SubmitFormRequestDto;
import com.pms.backend.dto.response.FormResponseDto;

import java.util.List;

public interface FormService {

    FormResponseDto createForm(FormRequestDto request);

    FormResponseDto getFormById(Long formId);

    List<FormResponseDto> getFormsByDrive(Long driveId);

    FormResponseDto updateForm(Long formId, FormRequestDto request);

    void publishForm(Long formId);

    void closeForm(Long formId);

    void deleteForm(Long formId);

    void submitForm(Long formId, SubmitFormRequestDto request);
}