import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(seconds: number): string {
    if (!seconds || seconds <= 0) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
