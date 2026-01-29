import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-controls.html',
  styles: []
})
export class AudioControlsComponent {
  @Input() currentTime = 0;
  @Input() duration = 0;
  @Input() isPlaying = false;
  @Input() volume = 0.7;
  @Input() isMuted = false;
  @Input() playbackRate = 1;
  @Input() trackTitle?: string;
  @Input() trackArtist?: string;
  
  @Output() togglePlay = new EventEmitter<void>();
  @Output() skip = new EventEmitter<number>();
  @Output() seek = new EventEmitter<number>();
  @Output() volumeChange = new EventEmitter<number>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() playbackRateChange = new EventEmitter<number>();

  Math = Math;

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onSeek(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.seek.emit(parseFloat(value));
  }

  onVolumeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.volumeChange.emit(parseFloat(value) / 100);
  }
}
