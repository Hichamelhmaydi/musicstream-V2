import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-card.html',
  styles: []
})
export class TrackCardComponent {
  @Input() track!: Track;
  @Output() play = new EventEmitter<Track>();
  @Output() delete = new EventEmitter<number>();

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop';
  }
}
