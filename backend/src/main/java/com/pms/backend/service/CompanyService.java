package com.pms.backend.service;

import com.pms.backend.dto.request.CompanyRequest;
import com.pms.backend.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {

    CompanyResponse createCompany(CompanyRequest request);

    List<CompanyResponse> getAllCompanies();

    CompanyResponse getCompanyById(Long id);

    CompanyResponse updateCompany(Long id, CompanyRequest request);

    void deleteCompany(Long id);
}