import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackCardComponent } from '../track-card/track-card';
import { SearchBarComponent } from '../search-bar/search-bar';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';
import { TrackService } from '../../services/track';
import { AudioPlayerService } from '../../services/audio-player';
import { Track, TrackFilters } from '../../models/track.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    TrackCardComponent, 
    SearchBarComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './library.html',
  styles: []
})
export class LibraryComponent implements OnInit {
  tracks: Track[] = [];
  filteredTracks: Track[] = [];
  loading = true;
  error: string | null = null;
  categories: string[] = [];
  
  currentFilters: TrackFilters = {
    search: '',
    category: '',
    sortBy: 'title',
    sortOrder: 'asc'
  };

  constructor(
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService
  ) {}

  ngOnInit(): void {
    this.loadTracks();
    
    this.trackService.tracks$.subscribe(tracks => {
      this.tracks = tracks;
      this.applyFilters();
    });

    this.trackService.loading$.subscribe(loading => {
      this.loading = loading;
    });

    this.trackService.error$.subscribe(error => {
      this.error = error;
    });
  }

  loadTracks(): void {
    this.trackService.loadTracks();
  }

  onFiltersChange(filters: TrackFilters): void {
    this.currentFilters = filters;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTracks = this.trackService.filterTracks(this.currentFilters);
    this.categories = this.trackService.getCategories();
  }

  playTrack(track: Track): void {
    this.audioPlayerService.playTrack(track);
  }

  deleteTrack(id: number): void {
    if (confirm('Are you sure you want to delete this track?')) {
      this.trackService.deleteTrack(id).subscribe({
        next: () => {
          this.trackService.loadTracks(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting track:', error);
        }
      });
    }
  }

  hasActiveFilters(): boolean {
    return !!this.currentFilters.search || !!this.currentFilters.category;
  }

  get totalTracks(): number {
    return this.tracks.length;
  }

  get totalDuration(): number {
    return this.tracks.reduce((sum, track) => sum + track.duration, 0) / 60;
  }

  get newTracks(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.tracks.filter(track => 
      track.addedDate && new Date(track.addedDate) > oneWeekAgo
    ).length;
  }
}
