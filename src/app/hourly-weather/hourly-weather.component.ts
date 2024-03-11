import { Component, Input } from '@angular/core';
import { Hourly } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hourly-weather',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="hourlyWeather">
      <p>hourly-weather works!</p>
      <p>The weather at 7pm today is/was {{ hourlyWeather.hours[19].temp }}F</p>
    </div>
  `,
  styleUrl: './hourly-weather.component.css',
})
export class HourlyWeatherComponent {
  @Input() hourlyWeather!: Hourly | undefined;
}
