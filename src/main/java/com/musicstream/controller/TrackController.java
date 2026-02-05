package com.musicstream.controller;

import com.musicstream.dto.TrackDTO;
import com.musicstream.dto.TrackUploadDTO;
import com.musicstream.service.TrackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
        origins = {"http://localhost:4200", "http://localhost:4201"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowedHeaders = "*",
        allowCredentials = "true"
)
public class TrackController {

    private final TrackService trackService;

    @GetMapping
    public ResponseEntity<List<TrackDTO>> getAllTracks() {
        try {
            log.info("GET /api/tracks - Fetching all tracks");
            List<TrackDTO> tracks = trackService.getAllTracks();
            log.info("Successfully fetched {} tracks", tracks.size());
            return ResponseEntity.ok(tracks);
        } catch (Exception e) {
            log.error("Error fetching all tracks", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getTrackById(@PathVariable Long id) {
        try {
            log.info("GET /api/tracks/{} - Fetching track", id);
            TrackDTO track = trackService.getTrackById(id);
            return ResponseEntity.ok(track);
        } catch (RuntimeException e) {
            log.error("Track not found with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            log.error("Error fetching track with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTrack(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("category") String category,
            @RequestParam("duration") Integer duration,
            @RequestParam("audioFile") MultipartFile audioFile,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile) {

        try {
            log.info("POST /api/tracks - Creating track: {}", title);
            log.info("Request details - Title: {}, Artist: {}, Category: {}, Duration: {}",
                    title, artist, category, duration);
            log.info("Audio file: {} (size: {} bytes, type: {})",
                    audioFile != null ? audioFile.getOriginalFilename() : "null",
                    audioFile != null ? audioFile.getSize() : 0,
                    audioFile != null ? audioFile.getContentType() : "null");
            log.info("Cover file: {} (size: {} bytes, type: {})",
                    coverFile != null ? coverFile.getOriginalFilename() : "null",
                    coverFile != null ? coverFile.getSize() : 0,
                    coverFile != null ? coverFile.getContentType() : "null");

            if (audioFile == null || audioFile.isEmpty()) {
                log.error("Audio file is missing or empty");
                Map<String, String> error = new HashMap<>();
                error.put("message", "Audio file is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            TrackUploadDTO trackUploadDTO = new TrackUploadDTO();
            trackUploadDTO.setTitle(title);
            trackUploadDTO.setArtist(artist);
            trackUploadDTO.setDescription(description);
            trackUploadDTO.setCategory(category);
            trackUploadDTO.setDuration(duration);
            trackUploadDTO.setAudioFile(audioFile);
            trackUploadDTO.setCoverFile(coverFile);

            TrackDTO createdTrack = trackService.createTrackWithFiles(trackUploadDTO);

            log.info("Track created successfully with id: {}", createdTrack.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTrack);

        } catch (IllegalArgumentException e) {
            log.error("Validation error creating track: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            log.error("Error creating track", e);
            e.printStackTrace(); // Print full stack trace for debugging
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create track: " + e.getMessage());
            error.put("type", e.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateTrack(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("category") String category,
            @RequestParam("duration") Integer duration,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile) {

        try {
            log.info("PUT /api/tracks/{} - Updating track", id);

            TrackUploadDTO trackUploadDTO = new TrackUploadDTO();
            trackUploadDTO.setTitle(title);
            trackUploadDTO.setArtist(artist);
            trackUploadDTO.setDescription(description);
            trackUploadDTO.setCategory(category);
            trackUploadDTO.setDuration(duration);
            trackUploadDTO.setAudioFile(audioFile);
            trackUploadDTO.setCoverFile(coverFile);

            TrackDTO updatedTrack = trackService.updateTrackWithFiles(id, trackUploadDTO);

            log.info("Track updated successfully with id: {}", id);
            return ResponseEntity.ok(updatedTrack);

        } catch (IllegalArgumentException e) {
            log.error("Validation error updating track: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                log.error("Track not found with id: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            throw e;
        } catch (Exception e) {
            log.error("Error updating track with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to update track: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrack(@PathVariable Long id) {
        try {
            log.info("DELETE /api/tracks/{} - Deleting track", id);
            trackService.deleteTrack(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                log.error("Track not found with id: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            throw e;
        } catch (Exception e) {
            log.error("Error deleting track with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete track: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @GetMapping("/search")
    public ResponseEntity<?> searchTracks(@RequestParam("q") String query) {
        try {
            log.info("GET /api/tracks/search?q={}", query);
            List<TrackDTO> tracks = trackService.searchTracks(query);
            return ResponseEntity.ok(tracks);
        } catch (Exception e) {
            log.error("Error searching tracks with query: {}", query, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to search tracks");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}