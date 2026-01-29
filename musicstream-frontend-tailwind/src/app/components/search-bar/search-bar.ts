import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackFilters } from '../../models/track.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styles: []
})
export class SearchBarComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<TrackFilters>();
  
  filters: TrackFilters = {
    search: '',
    category: '',
    sortBy: 'title',
    sortOrder: 'asc'
  };
  
  categories: string[] = [
    'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 
    'Electronic', 'R&B', 'Country', 'Reggae', 'Metal'
  ];

  ngOnInit(): void {
    this.onFiltersChange();
  }

  onFiltersChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  toggleSortOrder(): void {
    this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onFiltersChange();
  }

  clearSearch(): void {
    this.filters.search = '';
    this.onFiltersChange();
  }

  clearCategory(): void {
    this.filters.category = '';
    this.onFiltersChange();
  }

  hasActiveFilters(): boolean {
    return !!this.filters.search || !!this.filters.category;
  }
}
