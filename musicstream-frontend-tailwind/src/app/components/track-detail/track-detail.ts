import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TrackService } from '../../services/track';
import { AudioPlayerService } from '../../services/audio-player';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';
import { AudioControlsComponent } from '../audio-controls/audio-controls';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, AudioControlsComponent],
  templateUrl: './track-detail.html',
  styles: []
})
export class TrackDetailComponent implements OnInit {
  track?: Track;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadTrack(id);
  }

  loadTrack(id: number): void {
    this.loading = true;
    this.trackService.getTrackById(id).subscribe({
      next: (track) => {
        this.track = track;
        this.loading = false;
       
        this.audioPlayerService.playTrack(track);
      },
      error: (error) => {
        this.error = 'Failed to load track details';
        this.loading = false;
        console.error('Error loading track:', error);
      }
    });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  togglePlay(): void {
    this.audioPlayerService.togglePlay();
  }

  skip(seconds: number): void {
    this.audioPlayerService.skip(seconds);
  }

  seek(time: number): void {
    this.audioPlayerService.seekTo(time);
  }

  setVolume(volume: number): void {
    this.audioPlayerService.setVolume(volume);
  }

  toggleMute(): void {
    this.audioPlayerService.toggleMute();
  }

  setPlaybackRate(rate: number): void {
    this.audioPlayerService.setPlaybackRate(rate);
  }

  downloadTrack(): void {
    alert('Download functionality would be implemented here');
  }

  shareTrack(): void {
    alert('Share functionality would be implemented here');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop';
  }
}