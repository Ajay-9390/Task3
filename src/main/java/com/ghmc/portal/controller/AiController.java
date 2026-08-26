package com.ghmc.portal.controller;

import com.ghmc.portal.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * AI Grievance Auto-Categorizer & Priority Assessor (Gemini 1.5 Flash)
     */
    @PostMapping("/categorize")
    public ResponseEntity<Map<String, Object>> categorizeGrievance(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String description = payload.get("description");

        Map<String, Object> result = geminiService.analyzeGrievance(title, description);
        return ResponseEntity.ok(result);
    }

    /**
     * Conversational AI Assistant Chatbot (Gemini 1.5 Flash)
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithAi(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        String userEmail = payload.get("userEmail");

        Map<String, Object> result = geminiService.chatWithAi(userEmail, query);
        return ResponseEntity.ok(result);
    }

    /**
     * Executive Zone AI Summary Generator (Gemini 1.5 Flash)
     */
    @PostMapping("/summarize")
    public ResponseEntity<Map<String, Object>> summarizeZone(@RequestBody Map<String, String> payload) {
        String zoneCode = payload.get("zoneCode");

        Map<String, Object> result = geminiService.generateZoneExecutiveSummary(zoneCode);
        return ResponseEntity.ok(result);
    }
}
