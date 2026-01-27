package com.musicstream.controller;

import com.musicstream.dto.TrackDTO;
import com.musicstream.service.TrackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
public class TrackController {
    private final TrackService trackService;

    @GetMapping
    public ResponseEntity<List<TrackDTO>> getAllTracks() {
        return ResponseEntity.ok(trackService.getAllTracks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackDTO> getTrackById(@PathVariable Long id) {
        return ResponseEntity.ok(trackService.getTrackById(id));
    }

    @PostMapping
    public ResponseEntity<TrackDTO> createTrack(@Valid @RequestBody TrackDTO trackDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(trackService.createTrack(trackDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackDTO> updateTrack(
            @PathVariable Long id,
            @Valid @RequestBody TrackDTO trackDTO) {
        return ResponseEntity.ok(trackService.updateTrack(id, trackDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrack(@PathVariable Long id) {
        trackService.deleteTrack(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TrackDTO>> searchTracks(@RequestParam String q) {
        return ResponseEntity.ok(trackService.searchTracks(q));
    }
}