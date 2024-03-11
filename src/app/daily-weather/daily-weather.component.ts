import { Component, Input, inject } from '@angular/core';
import { Daily } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-weather',
  standalone: true,
  imports: [CommonModule],
  template: ` <div *ngIf="dailyWeather">
    <p>daily-weather works!</p>
    <p>Tomorrow's Max Temp: {{ dailyWeather.days[1].maxTemp }}F</p>
  </div>`,
  styleUrl: './daily-weather.component.css',
})
export class DailyWeatherComponent {
  @Input() dailyWeather!: Daily | undefined;
}
