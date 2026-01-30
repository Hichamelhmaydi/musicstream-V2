import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrackService } from '../../services/track';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';
import { Track } from '../../models/track.model';

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './track-form.html',
  styles: []
})
export class TrackFormComponent implements OnInit {
  trackForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  trackId?: number;
  
  categories = [
    'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical',
    'Electronic', 'R&B', 'Country', 'Reggae', 'Metal',
    'Blues', 'Folk', 'Indie', 'Alternative', 'Punk'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trackService: TrackService
  ) {
    this.trackForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      artist: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      category: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      audioUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      coverUrl: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.trackId = +id;
      this.loadTrack(this.trackId);
    }
    
    this.trackForm.valueChanges.subscribe(() => {
      this.submitError = null;
    });
  }

  loadTrack(id: number): void {
    this.trackService.getTrackById(id).subscribe({
      next: (track) => {
        this.trackForm.patchValue(track);
      },
      error: (error) => {
        console.error('Error loading track:', error);
        this.submitError = 'Failed to load track data';
      }
    });
  }

  get previewCoverUrl(): string {
    const url = this.trackForm.get('coverUrl')?.value;
    return url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.trackForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.trackForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.trackForm.controls).forEach(key => {
        this.trackForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const trackData: Track = this.trackForm.value;

    const operation = this.isEditMode 
      ? this.trackService.updateTrack(this.trackId!, trackData)
      : this.trackService.createTrack(trackData);

    operation.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error saving track:', error);
        this.submitError = error.message || 'Failed to save track. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onPreviewImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
  }
}
