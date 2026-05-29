package com.notesai.backend;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import java.io.IOException;
import java.util.Objects;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class AIController {

    @PostMapping("/ask")
    public AnswerResponse ask(@RequestBody QuestionRequest request) {

        RestTemplate restTemplate = new RestTemplate();

        String pythonUrl = "http://localhost:8000/ask";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<QuestionRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<AnswerResponse> response = restTemplate.postForEntity(
                pythonUrl,
                entity,
                AnswerResponse.class);

        return response.getBody();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String upload(
            @RequestPart("file") MultipartFile file) throws IOException {

        RestTemplate restTemplate = new RestTemplate();

        String pythonUrl = "http://localhost:8000/upload";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(
                file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(
                body,
                headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                pythonUrl,
                requestEntity,
                String.class);

        return response.getBody();
    }
}