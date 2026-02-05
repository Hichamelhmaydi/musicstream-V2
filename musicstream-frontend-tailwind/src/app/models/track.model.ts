export interface Track {
  id?: number;
  title: string;
  artist: string;
  description: string;
  category: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  addedDate?: Date;
}

export interface TrackUpload {
  title: string;
  artist: string;
  description: string;
  category: string;
  duration: number;
  audioFile?: File;
  coverFile?: File;
}

export interface TrackFilters {
  search: string;
  category: string;
  sortBy: 'title' | 'artist' | 'addedDate' | 'duration';
  sortOrder: 'asc' | 'desc';
}