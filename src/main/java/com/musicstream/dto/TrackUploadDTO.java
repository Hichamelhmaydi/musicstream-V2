package com.musicstream.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TrackUploadDTO {
    private String title;
    private String artist;
    private String description;
    private String category;
    private Integer duration;
    private MultipartFile audioFile;
    private MultipartFile coverFile;
}