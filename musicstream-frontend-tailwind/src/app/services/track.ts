import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Track, TrackFilters } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private apiUrl = 'http://localhost:8080/api/tracks';
  
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
    this.http.get<Track[]>(this.apiUrl).subscribe({
      next: (tracks) => {
        this.tracksSubject.next(tracks);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.errorSubject.next('Failed to load tracks');
        this.loadingSubject.next(false);
      }
    });
  }

  getTrackById(id: number): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/${id}`);
  }

  createTrack(track: Track): Observable<Track> {
    return this.http.post<Track>(this.apiUrl, track);
  }

  updateTrack(id: number, track: Track): Observable<Track> {
    return this.http.put<Track>(`${this.apiUrl}/${id}`, track);
  }

  deleteTrack(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchTracks(query: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.apiUrl}/search?q=${query}`);
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
    return Array.from(categories);
  }
}