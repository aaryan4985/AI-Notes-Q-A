package com.notesai.backend;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class AIController {

    @CrossOrigin(origins = "http://localhost:5173")
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
}