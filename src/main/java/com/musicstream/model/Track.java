package com.musicstream.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "tracks")
@Data
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String title;

    @Column(nullable = false, length = 50)
    private String artist;

    @Column(length = 200)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer duration;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "added_date")
    private LocalDateTime addedDate;

    @PrePersist
    protected void onCreate() {
        addedDate = LocalDateTime.now();
    }
}