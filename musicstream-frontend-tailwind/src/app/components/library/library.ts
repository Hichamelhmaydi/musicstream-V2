import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
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
export class LibraryComponent implements OnInit, OnDestroy {
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

  private destroy$ = new Subject<void>();

  constructor(
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService
  ) {}

  ngOnInit(): void {
    console.log(' LibraryComponent initialized');
    
    combineLatest([
      this.trackService.tracks$,
      this.trackService.loading$,
      this.trackService.error$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([tracks, loading, error]) => {
        console.log(' State update:', { 
          tracksCount: tracks.length, 
          loading, 
          error 
        });
        
        this.tracks = tracks;
        this.loading = loading;
        this.error = error;
        
        if (!loading) {
          this.applyFilters();
        }
      },
      error: (err) => {
        console.error(' Error in library component subscription:', err);
        this.loading = false;
        this.error = 'Failed to load tracks';
      }
    });

 
    console.log(' Current tracks count:', this.tracks.length);
    if (this.tracks.length === 0 && !this.loading) {
      console.log(' No tracks loaded, forcing reload...');
      this.trackService.loadTracks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
          this.trackService.loadTracks(); 
        },
        error: (error) => {
          console.error('Error deleting track:', error);
          this.error = 'Failed to delete track';
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