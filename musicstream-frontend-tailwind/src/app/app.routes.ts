
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/library/library')
      .then(m => m.LibraryComponent),
    title: 'Music Library - MusicStream'
  },
  {
    path: 'track/:id',
    loadComponent: () => import('./components/track-detail/track-detail')
      .then(m => m.TrackDetailComponent),
    title: 'Track Details - MusicStream'
  },
  {
    path: 'add',
    loadComponent: () => import('./components/track-form/track-form')
      .then(m => m.TrackFormComponent),
    title: 'Add Track - MusicStream'
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/track-form/track-form')
      .then(m => m.TrackFormComponent),
    title: 'Edit Track - MusicStream'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
