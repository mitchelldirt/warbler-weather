import { Component, Input, inject } from '@angular/core';
import { Daily } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-weather',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container" *ngIf="dailyWeather">
    <div class="first-row">
      <p class="text-var">DAILY WEATHER</p>
    </div>
    <div class="days-container">
      <div class="days-container">
        <div class="day-container" *ngFor="let day of dailyWeather.days">
          <div class="date-info">
            <p>{{ day.day }}</p>
            <p>{{ day.date }}</p>
          </div>

          <div class="weather-info-container">
            <div class="weather-info">
              <img
                class="icon"
                [src]="'https://' + day.icon"
                [alt]=""
                aria-hidden="true"
              />
              <p class="temp">{{ day.maxTemp }}°</p>
              <p class="temp-low">{{ day.minTemp }}°</p>
            </div>
          </div>

          <div class="conditions-info">
            <p>{{ day.condition }}</p>
          </div>

          <div class="precip-info">
            <img src="../../assets/waterdrop.svg" alt="Precipitation Chance" />
            <p>{{ day.precipitation }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  styleUrl: './daily-weather.component.css',
})
export class DailyWeatherComponent {
  @Input() dailyWeather!: Daily | undefined;
}
