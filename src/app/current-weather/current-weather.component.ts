import { Component, Input } from '@angular/core';
import { Current } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="container" *ngIf="currentWeather">
    <div class="first-row">
      <h2 class="text-var">CURRENT WEATHER</h2>
      <p class="bold">{{ currentWeather.time }}</p>
    </div>
    <div class="second-row">
      <div class="conditions">
        <img
          width="64"
          height="64"
          class="icon"
          [src]="'https://' + currentWeather.icon"
          [alt]="currentWeather.condition"
        />
        <p class="temp bold">{{ currentWeather.temp }}</p>
      </div>
      <div class="info">
        <div class="inner-row">
          <p>Wind</p>
          <p class="bold">{{ currentWeather.wind }}</p>
        </div>
        <div class="inner-row">
          <p>Humidity</p>
          <p class="bold">{{ currentWeather.humidity }}%</p>
        </div>
        <div class="inner-row">
          <p>Conditions</p>
          <p>{{ currentWeather.condition }}</p>
        </div>
      </div>
    </div>
  </div>`,
  styleUrl: './current-weather.component.css',
})
export class CurrentWeatherComponent {
  @Input() currentWeather!: Current | undefined;
}
