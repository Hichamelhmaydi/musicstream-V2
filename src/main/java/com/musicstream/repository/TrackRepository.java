package com.musicstream.repository;

import com.musicstream.model.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    List<Track> findByArtistContainingIgnoreCase(String artist);
    List<Track> findByTitleContainingIgnoreCase(String title);
    List<Track> findByCategory(String category);

    @Query("SELECT t FROM Track t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.artist) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Track> searchTracks(@Param("search") String search);
}