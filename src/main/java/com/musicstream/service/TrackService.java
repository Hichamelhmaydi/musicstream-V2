package com.musicstream.service;

import com.musicstream.dto.TrackDTO;
import com.musicstream.model.Track;
import com.musicstream.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackService {
    private final TrackRepository trackRepository;

    public List<TrackDTO> getAllTracks() {
        return trackRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TrackDTO getTrackById(Long id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found"));
        return convertToDTO(track);
    }

    public TrackDTO createTrack(TrackDTO trackDTO) {
        Track track = convertToEntity(trackDTO);
        Track savedTrack = trackRepository.save(track);
        return convertToDTO(savedTrack);
    }

    public TrackDTO updateTrack(Long id, TrackDTO trackDTO) {
        Track existingTrack = trackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Track not found"));

        existingTrack.setTitle(trackDTO.getTitle());
        existingTrack.setArtist(trackDTO.getArtist());
        existingTrack.setDescription(trackDTO.getDescription());
        existingTrack.setCategory(trackDTO.getCategory());
        existingTrack.setDuration(trackDTO.getDuration());
        existingTrack.setAudioUrl(trackDTO.getAudioUrl());
        existingTrack.setCoverUrl(trackDTO.getCoverUrl());

        Track updatedTrack = trackRepository.save(existingTrack);
        return convertToDTO(updatedTrack);
    }

    public void deleteTrack(Long id) {
        trackRepository.deleteById(id);
    }

    public List<TrackDTO> searchTracks(String query) {
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

    private Track convertToEntity(TrackDTO dto) {
        Track track = new Track();
        track.setTitle(dto.getTitle());
        track.setArtist(dto.getArtist());
        track.setDescription(dto.getDescription());
        track.setCategory(dto.getCategory());
        track.setDuration(dto.getDuration());
        track.setAudioUrl(dto.getAudioUrl());
        track.setCoverUrl(dto.getCoverUrl());
        return track;
    }
}