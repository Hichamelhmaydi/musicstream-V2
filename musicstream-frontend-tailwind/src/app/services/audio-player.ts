import { Injectable } from '@angular/core';
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
  private audioElement: HTMLAudioElement;
  
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

  constructor() {
    this.audioElement = new Audio();
    this.setupAudioListeners();
  }

  private setupAudioListeners(): void {
    this.audioElement.addEventListener('timeupdate', () => {
      this.stateSubject.next({
        ...this.stateSubject.value,
        currentTime: this.audioElement.currentTime,
        duration: this.audioElement.duration || 0
      });
    });

    this.audioElement.addEventListener('ended', () => {
      this.stateSubject.next({
        ...this.stateSubject.value,
        isPlaying: false,
        currentTime: 0
      });
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this.stateSubject.next({
        ...this.stateSubject.value,
        duration: this.audioElement.duration
      });
    });

    this.audioElement.addEventListener('volumechange', () => {
      this.stateSubject.next({
        ...this.stateSubject.value,
        volume: this.audioElement.volume,
        isMuted: this.audioElement.muted
      });
    });
  }

  playTrack(track: Track): void {
    if (this.audioElement.src !== track.audioUrl) {
      this.audioElement.src = track.audioUrl;
      this.audioElement.load();
    }
    
    this.audioElement.play();
    this.stateSubject.next({
      ...this.stateSubject.value,
      track,
      isPlaying: true
    });
  }

  pause(): void {
    this.audioElement.pause();
    this.stateSubject.next({
      ...this.stateSubject.value,
      isPlaying: false
    });
  }

  resume(): void {
    this.audioElement.play();
    this.stateSubject.next({
      ...this.stateSubject.value,
      isPlaying: true
    });
  }

  togglePlay(): void {
    if (this.stateSubject.value.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  seekTo(time: number): void {
    this.audioElement.currentTime = time;
    this.stateSubject.next({
      ...this.stateSubject.value,
      currentTime: time
    });
  }

  setVolume(volume: number): void {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute(): void {
    this.audioElement.muted = !this.audioElement.muted;
  }

  setPlaybackRate(rate: number): void {
    this.audioElement.playbackRate = rate;
    this.stateSubject.next({
      ...this.stateSubject.value,
      playbackRate: rate
    });
  }

  skip(seconds: number): void {
    const newTime = this.audioElement.currentTime + seconds;
    this.seekTo(Math.max(0, Math.min(newTime, this.audioElement.duration)));
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}