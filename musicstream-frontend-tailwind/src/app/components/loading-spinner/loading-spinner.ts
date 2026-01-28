import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./loading-spinner.html' ,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() fullScreen = false;
}
