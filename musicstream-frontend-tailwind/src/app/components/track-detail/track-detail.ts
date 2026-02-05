import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🔍 TrackDetailComponent initialized');

    const idParam = this.route.snapshot.params['id'];
    console.log(' Route param ID:', idParam, 'Type:', typeof idParam);

    const id = Number(idParam);
    console.log('🔢 Converted ID:', id);

    if (isNaN(id)) {
      console.error(' Invalid ID - not a number');
      this.error = 'Invalid track ID';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadTrack(id);
  }

  loadTrack(id: number): void {
    console.log('🎵 Loading track with ID:', id);
    this.loading = true;
    this.error = null;

    this.trackService.getTrackById(id).subscribe({
      next: (track) => {
        console.log(' Track loaded successfully:', track);
        console.log('Track data:', {
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration
        });

        this.track = track;
        this.loading = false;

        console.log(' Component state after loading:', {
          loading: this.loading,
          hasTrack: !!this.track,
          trackTitle: this.track?.title
        });

        this.cdr.detectChanges();

        console.log(' Change detection triggered');
      },
      error: (error) => {
        console.error(' Error loading track:', error);
        this.error = 'Failed to load track details';
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('✔ Track loading completed');
      }
    });
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  shareTrack(): void {
    alert('Share functionality would be implemented here');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop';
  }
}
