import { Component, Input } from '@angular/core';
import { Current } from '../weather';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  template: ` <div class="container" *ngIf="currentWeather">
    <div class="first-row">
      <p class="text-var">CURRENT WEATHER</p>
      <p>{{ currentWeather.time }}</p>
    </div>
    <div class="second-row">
      <div class="conditions">
        <img
          class="icon"
          [src]="'https://' + currentWeather.icon"
          [alt]="currentWeather.condition"
        />
        <p class="temp">{{ currentWeather.temp }}</p>
      </div>
      <div class="info">
        <div class="inner-row">
          <p>Wind</p>
          <p>{{ currentWeather.wind }}</p>
        </div>
        <div class="inner-row">
          <p>Humidity</p>
          <p>{{ currentWeather.humidity }}%</p>
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
