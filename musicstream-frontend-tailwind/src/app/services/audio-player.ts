import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';

export interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {

  private audioElement?: HTMLAudioElement;
  private isBrowser: boolean;

  private stateSubject = new BehaviorSubject<PlayerState>({
    track: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    playbackRate: 1
  });

  state$ = this.stateSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.audioElement = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners(): void {
    if (!this.audioElement) return;

    this.audioElement.addEventListener('timeupdate', () => {
      this.updateState({
        currentTime: this.audioElement!.currentTime,
        duration: this.audioElement!.duration || 0
      });
    });

    this.audioElement.addEventListener('ended', () => {
      this.updateState({
        isPlaying: false,
        currentTime: 0
      });
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.updateState({
        duration: this.audioElement!.duration
      });
    });

    this.audioElement.addEventListener('volumechange', () => {
      this.updateState({
        volume: this.audioElement!.volume,
        isMuted: this.audioElement!.muted
      });
    });
  }

  playTrack(track: Track): void {
    if (!this.audioElement) return;

    if (this.audioElement.src !== track.audioUrl) {
      this.audioElement.src = track.audioUrl;
      this.audioElement.load();
    }

    this.audioElement.play();
    this.updateState({
      track,
      isPlaying: true
    });
  }

  pause(): void {
    if (!this.audioElement) return;

    this.audioElement.pause();
    this.updateState({ isPlaying: false });
  }

  resume(): void {
    if (!this.audioElement) return;

    this.audioElement.play();
    this.updateState({ isPlaying: true });
  }

  togglePlay(): void {
    this.stateSubject.value.isPlaying ? this.pause() : this.resume();
  }

  seekTo(time: number): void {
    if (!this.audioElement) return;

    this.audioElement.currentTime = time;
    this.updateState({ currentTime: time });
  }

  setVolume(volume: number): void {
    if (!this.audioElement) return;

    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute(): void {
    if (!this.audioElement) return;

    this.audioElement.muted = !this.audioElement.muted;
  }

  setPlaybackRate(rate: number): void {
    if (!this.audioElement) return;

    this.audioElement.playbackRate = rate;
    this.updateState({ playbackRate: rate });
  }

  skip(seconds: number): void {
    if (!this.audioElement) return;

    const newTime = this.audioElement.currentTime + seconds;
    this.seekTo(Math.max(0, Math.min(newTime, this.audioElement.duration)));
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private updateState(partial: Partial<PlayerState>) {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial
    });
  }
}
