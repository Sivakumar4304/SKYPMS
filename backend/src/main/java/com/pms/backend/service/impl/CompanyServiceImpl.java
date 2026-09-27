package com.pms.backend.service.impl;

import com.pms.backend.dto.request.CompanyRequest;
import com.pms.backend.dto.response.CompanyResponse;
import com.pms.backend.entity.Company;
import com.pms.backend.repository.CompanyRepository;
import com.pms.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Override
    public CompanyResponse createCompany(CompanyRequest request) {

        if (companyRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Company already exists");
        }

        Company company = Company.builder()
                .name(request.getName())
                .website(request.getWebsite())
                .logo(request.getLogo())
                .description(request.getDescription())
                .location(request.getLocation())
                .build();

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CompanyResponse getCompanyById(Long id) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return mapToResponse(company);
    }

    @Override
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setLogo(request.getLogo());
        company.setDescription(request.getDescription());
        company.setLocation(request.getLocation());

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    public void deleteCompany(Long id) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        companyRepository.delete(company);
    }

    private CompanyResponse mapToResponse(Company company) {

        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .website(company.getWebsite())
                .logo(company.getLogo())
                .description(company.getDescription())
                .location(company.getLocation())
                .build();
    }
}