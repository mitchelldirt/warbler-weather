import { Component, Input, inject } from '@angular/core';
import { Daily } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-weather',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container" *ngIf="dailyWeather">
    <div class="first-row">
      <h2 class="text-var" i18n>DAILY WEATHER</h2>
    </div>
    <div class="days-container">
      <div class="days-container">
        <div class="day-container" *ngFor="let day of dailyWeather.days">
          <div class="date-info">
            <p class="bold">{{ day.day }}</p>
            <p class="date">{{ day.date }}</p>
          </div>

          <div class="weather-info-container">
            <div class="weather-info">
              <img
                width="64"
                height="64"
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
            <p class="bold">{{ day.condition }}</p>
          </div>

          <div class="precip-info">
            <img
              width="20"
              height="20"
              src="../../assets/waterdrop.svg"
              alt="Precipitation Chance"
            />
            <p class="precipitation">{{ day.precipitation }}%</p>
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
