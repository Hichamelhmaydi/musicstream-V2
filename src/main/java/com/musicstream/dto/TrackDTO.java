package com.musicstream.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TrackDTO {
    private Long id;
    private String title;
    private String artist;
    private String description;
    private String category;
    private Integer duration;
    private String audioUrl;
    private String coverUrl;
    private LocalDateTime addedDate;
}