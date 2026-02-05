import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrackService } from '../../services/track';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner';
import { DurationPipe } from '../../pipes/duration.pipe';
import { Track, TrackUpload } from '../../models/track.model';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, DurationPipe],
  templateUrl: './track-form.html',
})
export class TrackFormComponent implements OnInit, OnDestroy {
  trackForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;
  submitError: string | null = null;
  trackId?: number;
  currentTrack?: Track;
  
  audioFile: File | null = null;
  coverFile: File | null = null;
  audioFileError: string | null = null;
  coverFileError: string | null = null;
  audioPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  
  removeAudio = false;
  removeCover = false;
  
  private destroy$ = new Subject<void>();
  
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
      duration: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.trackId = +id;
      this.loadTrack(this.trackId);
    }
    
    this.trackForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.submitError = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.revokeObjectUrls();
  }

 
  private revokeObjectUrls(): void {
    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
      this.audioPreviewUrl = null;
    }
    if (this.coverPreviewUrl) {
      URL.revokeObjectURL(this.coverPreviewUrl);
      this.coverPreviewUrl = null;
    }
  }


  loadTrack(id: number): void {
    this.isLoading = true;
    this.submitError = null;
    
    this.trackService.getTrackById(id)
      .pipe(
        finalize(() => this.isLoading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (track) => {
          this.currentTrack = track;
          this.trackForm.patchValue({
            title: track.title,
            artist: track.artist,
            description: track.description,
            category: track.category,
            duration: track.duration
          });
        },
        error: (error) => {
          console.error('Error loading track:', error);
          this.submitError = 'Failed to load track data. Please try again.';
        }
      });
  }


  onAudioFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    console.log('Audio file selected:', file?.name, file?.type, file?.size);
    
    if (!file) return;
    
    this.audioFileError = null;
    
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    const allowedExtensions = ['.mp3', '.wav', '.ogg'];
    const maxSize = 10 * 1024 * 1024; 
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      this.audioFileError = 'Invalid audio format. Please use MP3, WAV, or OGG.';
      input.value = '';
      console.error('Invalid audio format:', file.type, fileExtension);
      return;
    }
    
    if (file.size > maxSize) {
      this.audioFileError = 'File size too large. Maximum size is 10MB.';
      input.value = '';
      console.error('File too large:', file.size);
      return;
    }
    
    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
    }
    
    this.audioFile = file;
    this.audioFile = file;
    this.removeAudio = false; 
    this.audioFileError = null;
    
    this.audioPreviewUrl = URL.createObjectURL(file);
    
    console.log('Audio file set successfully:', this.audioFile.name);
  }


  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    console.log('Cover file selected:', file?.name, file?.type, file?.size);
    
    if (!file) return;
    
    this.coverFileError = null;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const maxSize = 5 * 1024 * 1024; 
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      this.coverFileError = 'Invalid image format. Please use JPG, PNG, GIF, or WebP.';
      input.value = '';
      console.error('Invalid image format:', file.type, fileExtension);
      return;
    }
    
    if (file.size > maxSize) {
      this.coverFileError = 'File size too large. Maximum size is 5MB.';
      input.value = '';
      console.error('File too large:', file.size);
      return;
    }
    
    if (this.coverPreviewUrl) {
      URL.revokeObjectURL(this.coverPreviewUrl);
    }
    
    this.coverFile = file;
    this.removeCover = false; 
    this.coverFileError = null;
    
    this.coverPreviewUrl = URL.createObjectURL(file);
    
    console.log('Cover file set successfully:', this.coverFile.name);
  }

 
  getFullAudioUrl(): string {
    if (this.currentTrack?.audioUrl) {
      return this.currentTrack.audioUrl; 
    }
    return '';
  }


  getFullCoverUrl(): string {
    if (this.currentTrack?.coverUrl) {
      return this.currentTrack.coverUrl; 
    }
    return '';
  }


  getAudioPreviewUrl(): string {
    if (this.audioPreviewUrl) {
      return this.audioPreviewUrl;
    } else if (this.currentTrack?.audioUrl && !this.removeAudio) {
      return this.getFullAudioUrl();
    }
    return '';
  }

  
  getCoverPreviewUrl(): string {
    if (this.coverPreviewUrl) {
      return this.coverPreviewUrl;
    } else if (this.currentTrack?.coverUrl && !this.removeCover) {
      return this.getFullCoverUrl();
    }
    return '';
  }

  getPreviewCoverUrl(): string {
    const url = this.getCoverPreviewUrl();
    return url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.trackForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }


  hasValidAudioFile(): boolean {
    if (!this.isEditMode) {
      return !!this.audioFile;
    }
    
    return !!this.audioFile || (!!this.currentTrack?.audioUrl && !this.removeAudio);
  }

 
  canSubmit(): boolean {
    const canSubmit = this.trackForm.valid && !this.isSubmitting && this.hasValidAudioFile();
    console.log('Can submit check:', {
      formValid: this.trackForm.valid,
      isSubmitting: this.isSubmitting,
      hasAudioFile: this.hasValidAudioFile(),
      canSubmit: canSubmit
    });
    return canSubmit;
  }


  removeCurrentAudio(): void {
    this.removeAudio = true;
    this.audioFile = null;
    
    if (this.audioPreviewUrl) {
      URL.revokeObjectURL(this.audioPreviewUrl);
      this.audioPreviewUrl = null;
    }
  }


  removeCurrentCover(): void {
    this.removeCover = true;
    this.coverFile = null;
    
    if (this.coverPreviewUrl) {
      URL.revokeObjectURL(this.coverPreviewUrl);
      this.coverPreviewUrl = null;
    }
  }

  
  formatFileSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    if (mb < 0.01) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  }

  onSubmit(): void {
    console.log('=== SUBMIT STARTED ===');
    console.log('Submit clicked', {
      formValid: this.trackForm.valid,
      formValue: this.trackForm.value,
      formErrors: this.getFormErrors(),
      audioFile: this.audioFile ? {
        name: this.audioFile.name,
        size: this.audioFile.size,
        type: this.audioFile.type
      } : null,
      coverFile: this.coverFile ? {
        name: this.coverFile.name,
        size: this.coverFile.size,
        type: this.coverFile.type
      } : null,
      canSubmit: this.canSubmit(),
      isSubmitting: this.isSubmitting,
      isEditMode: this.isEditMode
    });

    this.trackForm.markAllAsTouched();

    if (!this.canSubmit()) {
      console.error('Cannot submit - validation failed');
      if (!this.trackForm.valid) {
        console.error('Form is invalid:', this.getFormErrors());
      }
      if (!this.hasValidAudioFile()) {
        console.error('No audio file provided');
      }
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const formValue = this.trackForm.value;
    
    const trackUpload: TrackUpload = {
      title: formValue.title,
      artist: formValue.artist,
      description: formValue.description || '',
      category: formValue.category,
      duration: Number(formValue.duration),
      audioFile: this.audioFile || undefined,
      coverFile: this.coverFile || undefined
    };

    console.log('Track upload data:', trackUpload);

    const operation$ = this.isEditMode
      ? this.trackService.updateTrack(this.trackId!, trackUpload)
      : this.trackService.createTrack(trackUpload);

    console.log('Starting HTTP request...');

    operation$
      .pipe(
        finalize(() => {
          console.log('HTTP request completed (finalize)');
          this.isSubmitting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('=== SUCCESS ===');
          console.log('Track saved successfully:', response);
          
          this.trackService.loadTracks();
          
          console.log('Navigating to home...');
          this.router.navigate(['/'])
            .then(() => {
              console.log('Navigation successful');
            })
            .catch(error => {
              console.error('Navigation error:', error);
              this.submitError = 'Track saved but navigation failed. Please refresh the page.';
            });
        },
        error: (error) => {
          console.error('=== ERROR ===');
          console.error('Submit error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          
          let message = 'Failed to save track';
          if (error.error?.message) {
            message = error.error.message;
          } else if (error.message) {
            message = error.message;
          } else if (error.status) {
            message = `Server error: ${error.status}`;
          }
          this.submitError = `Error: ${message}. Please check the console for details.`;
        }
      });
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.trackForm.controls).forEach(key => {
      const control = this.trackForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onPreviewImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
  }


  onCoverPreviewError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
  }
}