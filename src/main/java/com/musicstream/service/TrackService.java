package com.musicstream.service;

import com.musicstream.dto.TrackDTO;
import com.musicstream.dto.TrackUploadDTO;
import com.musicstream.model.Track;
import com.musicstream.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackService {
    private final TrackRepository trackRepository;
    private final StorageService storageService;

    public List<TrackDTO> getAllTracks() {
        log.info("Fetching all tracks");
        return trackRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    public TrackDTO getTrackById(Long id) {
        log.info("Fetching track with id: {}", id);
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found with id: " + id));
        return convertToDTO(track);
    }


    @Transactional
    public TrackDTO createTrackWithFiles(TrackUploadDTO trackUploadDTO) {
        log.info("Creating new track: {}", trackUploadDTO.getTitle());

        if (trackUploadDTO == null) {
            throw new IllegalArgumentException("Track upload data cannot be null");
        }

        if (trackUploadDTO.getTitle() == null || trackUploadDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Track title is required");
        }

        if (trackUploadDTO.getArtist() == null || trackUploadDTO.getArtist().trim().isEmpty()) {
            throw new IllegalArgumentException("Artist name is required");
        }

        if (trackUploadDTO.getCategory() == null || trackUploadDTO.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }

        if (trackUploadDTO.getDuration() == null || trackUploadDTO.getDuration() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }

        if (trackUploadDTO.getAudioFile() == null || trackUploadDTO.getAudioFile().isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        try {
            log.info("Storing audio file: {}", trackUploadDTO.getAudioFile().getOriginalFilename());
            String audioUrl = storageService.storeAudioFile(trackUploadDTO.getAudioFile());


            String coverUrl = null;
            if (trackUploadDTO.getCoverFile() != null && !trackUploadDTO.getCoverFile().isEmpty()) {
                log.info("Storing cover file: {}", trackUploadDTO.getCoverFile().getOriginalFilename());
                coverUrl = storageService.storeImageFile(trackUploadDTO.getCoverFile());
            }

            Track track = new Track();
            track.setTitle(trackUploadDTO.getTitle().trim());
            track.setArtist(trackUploadDTO.getArtist().trim());
            track.setDescription(trackUploadDTO.getDescription() != null ? trackUploadDTO.getDescription().trim() : "");
            track.setCategory(trackUploadDTO.getCategory().trim());
            track.setDuration(trackUploadDTO.getDuration());
            track.setAudioUrl(audioUrl);
            track.setCoverUrl(coverUrl);
            track.setAddedDate(LocalDateTime.now());

            Track savedTrack = trackRepository.save(track);
            log.info("Track created successfully with id: {}", savedTrack.getId());

            return convertToDTO(savedTrack);

        } catch (Exception e) {
            log.error("Error creating track: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create track: " + e.getMessage(), e);
        }
    }


    @Transactional
    public TrackDTO updateTrackWithFiles(Long id, TrackUploadDTO trackUploadDTO) {
        log.info("Updating track with id: {}", id);

        if (trackUploadDTO == null) {
            throw new IllegalArgumentException("Track upload data cannot be null");
        }

        Track existingTrack = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found with id: " + id));

        try {
            if (trackUploadDTO.getTitle() != null && !trackUploadDTO.getTitle().trim().isEmpty()) {
                existingTrack.setTitle(trackUploadDTO.getTitle().trim());
            }

            if (trackUploadDTO.getArtist() != null && !trackUploadDTO.getArtist().trim().isEmpty()) {
                existingTrack.setArtist(trackUploadDTO.getArtist().trim());
            }

            if (trackUploadDTO.getDescription() != null) {
                existingTrack.setDescription(trackUploadDTO.getDescription().trim());
            }

            if (trackUploadDTO.getCategory() != null && !trackUploadDTO.getCategory().trim().isEmpty()) {
                existingTrack.setCategory(trackUploadDTO.getCategory().trim());
            }

            if (trackUploadDTO.getDuration() != null && trackUploadDTO.getDuration() > 0) {
                existingTrack.setDuration(trackUploadDTO.getDuration());
            }

            if (trackUploadDTO.getAudioFile() != null && !trackUploadDTO.getAudioFile().isEmpty()) {
                log.info("Updating audio file");

                if (existingTrack.getAudioUrl() != null) {
                    storageService.deleteFile(existingTrack.getAudioUrl());
                }

                String audioUrl = storageService.storeAudioFile(trackUploadDTO.getAudioFile());
                existingTrack.setAudioUrl(audioUrl);
            }

            if (trackUploadDTO.getCoverFile() != null && !trackUploadDTO.getCoverFile().isEmpty()) {
                log.info("Updating cover file");

                if (existingTrack.getCoverUrl() != null) {
                    storageService.deleteFile(existingTrack.getCoverUrl());
                }

                String coverUrl = storageService.storeImageFile(trackUploadDTO.getCoverFile());
                existingTrack.setCoverUrl(coverUrl);
            }

            Track updatedTrack = trackRepository.save(existingTrack);
            log.info("Track updated successfully with id: {}", updatedTrack.getId());

            return convertToDTO(updatedTrack);

        } catch (Exception e) {
            log.error("Error updating track: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update track: " + e.getMessage(), e);
        }
    }


    @Transactional
    public void deleteTrack(Long id) {
        log.info("Deleting track with id: {}", id);

        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found with id: " + id));

        try {
            if (track.getAudioUrl() != null) {
                log.info("Deleting audio file: {}", track.getAudioUrl());
                storageService.deleteFile(track.getAudioUrl());
            }

            if (track.getCoverUrl() != null) {
                log.info("Deleting cover file: {}", track.getCoverUrl());
                storageService.deleteFile(track.getCoverUrl());
            }

            trackRepository.delete(track);
            log.info("Track deleted successfully with id: {}", id);

        } catch (Exception e) {
            log.error("Error deleting track: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete track: " + e.getMessage(), e);
        }
    }


    public List<TrackDTO> searchTracks(String query) {
        log.info("Searching tracks with query: {}", query);

        if (query == null || query.trim().isEmpty()) {
            return getAllTracks();
        }

        return trackRepository.searchTracks(query)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private TrackDTO convertToDTO(Track track) {
        TrackDTO dto = new TrackDTO();
        dto.setId(track.getId());
        dto.setTitle(track.getTitle());
        dto.setArtist(track.getArtist());
        dto.setDescription(track.getDescription());
        dto.setCategory(track.getCategory());
        dto.setDuration(track.getDuration());
        dto.setAudioUrl(track.getAudioUrl());
        dto.setCoverUrl(track.getCoverUrl());
        dto.setAddedDate(track.getAddedDate());
        return dto;
    }
}