import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { AudioControlsComponent } from './components/audio-controls/audio-controls';
import { AudioPlayerService, PlayerState } from './services/audio-player';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, AudioControlsComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  title = 'MusicStream';
  isLoading = true;
  playerState: PlayerState;

  constructor(private audioPlayerService: AudioPlayerService) {
    this.playerState = {
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      playbackRate: 1
    };
  }

  ngOnInit(): void {
    // Simulate initial loading
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    // Subscribe to audio player state changes
    this.audioPlayerService.state$.subscribe(state => {
      this.playerState = state;
    });
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

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.setVolume(parseFloat(value) / 100);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}