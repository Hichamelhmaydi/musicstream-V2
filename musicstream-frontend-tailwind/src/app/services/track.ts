import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Track, TrackUpload, TrackFilters } from '../models/track.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = `${environment.apiUrl}/tracks`;
  private baseUrl = environment.apiUrl.replace('/api', '');

  private tracksSubject = new BehaviorSubject<Track[]>([]);
  tracks$ = this.tracksSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTracks();
  }

  
  loadTracks(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    this.http.get<Track[]>(this.apiUrl).pipe(
      map(tracks => tracks.map(track => this.convertToAbsoluteUrls(track))),
      catchError(error => {
        this.errorSubject.next('Failed to load tracks');
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe({
      next: (tracks) => {
        this.tracksSubject.next(tracks);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      }
    });
  }

 
  private convertToAbsoluteUrls(track: Track): Track {
    const convertedTrack = { ...track }; // Create a copy to avoid mutation
    
    if (convertedTrack.audioUrl && convertedTrack.audioUrl.startsWith('/uploads')) {
      convertedTrack.audioUrl = `${this.baseUrl}${convertedTrack.audioUrl}`;
    }
    
    if (convertedTrack.coverUrl && convertedTrack.coverUrl.startsWith('/uploads')) {
      convertedTrack.coverUrl = `${this.baseUrl}${convertedTrack.coverUrl}`;
    }
    
    return convertedTrack;
  }

  
  getAllTracks(): Observable<Track[]> {
    return this.http.get<Track[]>(this.apiUrl).pipe(
      map(tracks => tracks.map(track => this.convertToAbsoluteUrls(track))),
      catchError(error => {
        this.errorSubject.next('Failed to fetch tracks');
        throw error;
      })
    );
  }


  getTrackById(id: number): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/${id}`).pipe(
      map(track => this.convertToAbsoluteUrls(track)),
      catchError(error => {
        this.errorSubject.next(`Failed to load track with ID ${id}`);
        throw error;
      })
    );
  }

  
createTrack(trackUpload: TrackUpload): Observable<Track> {
  const formData = this.buildFormData(trackUpload);
  
  console.log('Sending track data:', {
    title: trackUpload.title,
    artist: trackUpload.artist,
    duration: trackUpload.duration,
    audioFile: trackUpload.audioFile?.name
  });
  
  return this.http.post<Track>(this.apiUrl, formData).pipe(
    map(track => {
      console.log('Track created successfully:', track);
      return this.convertToAbsoluteUrls(track);
    }),
    catchError(error => {
      console.error('Error creating track:', error);
      const errorMessage = error.error?.message || 'Failed to create track';
      this.errorSubject.next(errorMessage);
      throw error;
    })
  );
}

 
  updateTrack(id: number, trackUpload: TrackUpload): Observable<Track> {
    const formData = this.buildFormData(trackUpload);
    
    return this.http.put<Track>(`${this.apiUrl}/${id}`, formData).pipe(
      map(track => this.convertToAbsoluteUrls(track)),
      catchError(error => {
        const errorMessage = error.error?.message || `Failed to update track with ID ${id}`;
        this.errorSubject.next(errorMessage);
        throw error;
      })
    );
  }

 
  deleteTrack(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || `Failed to delete track with ID ${id}`;
        this.errorSubject.next(errorMessage);
        throw error;
      })
      
    );
  }


  searchTracks(query: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`).pipe(
      map(tracks => tracks.map(track => this.convertToAbsoluteUrls(track))),
      catchError(error => {
        this.errorSubject.next('Failed to search tracks');
        throw error;
      })
    );
  }


  filterTracks(filters: TrackFilters): Track[] {
    const tracks = this.tracksSubject.value;
    
    return tracks.filter(track => {
      const matchesSearch = !filters.search || 
        track.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        track.artist.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || 
        track.category === filters.category;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return filters.sortOrder === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });
  }

  getCategories(): string[] {
    const tracks = this.tracksSubject.value;
    const categories = new Set(tracks.map(track => track.category));
    return Array.from(categories).sort();
  }

 
  private buildFormData(trackUpload: TrackUpload): FormData {
    const formData = new FormData();

    formData.append('title', trackUpload.title);
    formData.append('artist', trackUpload.artist);
    formData.append('description', trackUpload.description);
    formData.append('category', trackUpload.category);
    formData.append('duration', trackUpload.duration.toString());

    if (trackUpload.audioFile) {
      formData.append('audioFile', trackUpload.audioFile);
    }

    if (trackUpload.coverFile) {
      formData.append('coverFile', trackUpload.coverFile);
    }

    return formData;
  }
}