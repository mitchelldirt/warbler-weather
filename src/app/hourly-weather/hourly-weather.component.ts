import { Component, Input, HostListener } from '@angular/core';
import { Hourly } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hourly-weather',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" *ngIf="hourlyWeather">
      <div class="first-row">
        <h2 class="text-var">HOURLY WEATHER</h2>
      </div>
      <div class="hours-container">
        <div *ngFor="let hour of hourlyWeather.hours">
          <div class="hour-container">
            <p *ngIf="getScreenWidth() <= 450">
              {{ truncateTime(hour.time) }}
              {{ hour.time.split(' ')[1] }}
            </p>
            <p class="time" *ngIf="getScreenWidth() > 450">
              {{ hour.time }}
            </p>
            <img
              width="64"
              height="64"
              class="icon"
              [src]="'https://' + hour.icon"
              [alt]=""
              aria-hidden="true"
            />

            <p class="temp bold">{{ hour.temp }}</p>
            <div class="humidity-container">
              <img
                src="../../assets/waterdrop.svg"
                alt="waterdrop"
                aria-hidden="true"
              />
              <p class="humidity">{{ hour.precipitation }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './hourly-weather.component.css',
})
export class HourlyWeatherComponent {
  @Input() hourlyWeather!: Hourly | undefined;
  readonly findFirstZeroRegex = /(?=\d)0/;
  // regex to find the first zero in a string with a digit after it

  getScreenWidth() {
    return window.innerWidth;
  }

  truncateTime(time: string) {
    return time.split(' ')[0][0] === '0'
      ? time.split(' ')[0].slice(1, 2)
      : time.split(' ')[0].split(':')[0];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getScreenWidth();
  }
}
