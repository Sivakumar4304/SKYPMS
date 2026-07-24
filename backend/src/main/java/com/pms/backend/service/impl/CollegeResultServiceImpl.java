package com.pms.backend.service.impl;

import com.pms.backend.dto.CollegeResultResponse;
import com.pms.backend.service.CollegeResultService;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CollegeResultServiceImpl implements CollegeResultService {

    @Override
    public CollegeResultResponse fetchResults(String rollNumber) {

        if (rollNumber == null || rollNumber.isBlank()) {
            throw new IllegalArgumentException("Roll number must not be empty");
        }

        try {

            Document document = Jsoup.connect("https://vishnu.edu.in/Student-Results")
                    .method(Connection.Method.POST)
                    .data("sroll", rollNumber)
                    .data("browse", "View Result")
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .post();

            Element cgpaElement = document.select("td").stream()
                    .filter(td -> td.text().contains("CGPA"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("CGPA not found"));
            String cgpa = cgpaElement.selectFirst("b").text();
            if(cgpa.equals("NAN")){
                System.out.println("NAN");
                throw new RuntimeException("CGPA not found");
            }
            List<Double> sgpas = new ArrayList<>();
            Elements sgpaElements = document.select("td.rbox");
            for(Element td: sgpaElements){
                String text = td.text();
                if(text.startsWith("Semester Grade Point Average") ||
                        text.startsWith("Estimated Semester Grade Point Average")){
                    String value = text.substring(text.lastIndexOf(":") + 1).trim();
                    sgpas.add(Double.parseDouble(value));
                }
            }
            Element backlog = document.selectFirst("span.numberCircle");

            int totalBacklogs = 0;

            if (backlog != null) {

                String value = backlog.text().trim();

                if (!value.equals("-Nil-")) {
                    totalBacklogs = Integer.parseInt(value);
                }
            }

            System.out.println("Backlogs = " + totalBacklogs);
            System.out.println(sgpas);
            System.out.println("CGPA = " + cgpa);

            return CollegeResultResponse.builder()
                    .cgpa(Double.parseDouble(cgpa))
                    .sgpas(sgpas)
                    .totalBacklogs(totalBacklogs)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Unable to fetch student results", e);
        }
    }
}