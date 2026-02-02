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
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <app-header></app-header>
      
      <main class="flex-1 container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </main>

      <footer *ngIf="playerState.track" 
              class="sticky bottom-0 border-t border-gray-200 bg-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <app-audio-controls
            [currentTime]="playerState.currentTime"
            [duration]="playerState.duration"
            [isPlaying]="playerState.isPlaying"
            [volume]="playerState.volume"
            [isMuted]="playerState.isMuted"
            [playbackRate]="playerState.playbackRate"
            [trackTitle]="playerState.track?.title"
            [trackArtist]="playerState.track?.artist"
            (togglePlay)="togglePlay()"
            (skip)="skip($event)"
            (seek)="seek($event)"
            (volumeChange)="setVolume($event)"
            (toggleMute)="toggleMute()"
            (playbackRateChange)="setPlaybackRate($event)">
          </app-audio-controls>
        </div>
      </footer>

     
    </div>
  `,
  styles: []
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
    
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    
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
}
