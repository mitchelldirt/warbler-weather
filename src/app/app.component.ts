import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { AlertsComponent } from './alerts/alerts.component';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { HourlyWeatherComponent } from './hourly-weather/hourly-weather.component';
import { DailyWeatherComponent } from './daily-weather/daily-weather.component';
import { WeatherService } from './weather.service';
import { Coordinates } from './coordinates';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Weather } from './weather';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SettingsComponent,
    AlertsComponent,
    CurrentWeatherComponent,
    HourlyWeatherComponent,
    DailyWeatherComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <main>
      <header class="header">
        <h1>Warbler</h1>
        <app-settings class="settings"></app-settings>
      </header>
      <form
        (ngSubmit)="onFormSubmit($event); (false)"
        class="location-search-form"
      >
        <button (click)="getCurrentLocation()" type="button">
          <img src="../assets/location.svg" alt="get my location icon" />
        </button>

        <input
          placeholder="Search your Address, City, or Zip Code"
          type="text"
          #filter
        />
        <button type="submit" (click)="getCoords(filter.value)">
          <img
            src="../assets/search.svg"
            alt="search icon"
            aria-hidden="true"
          />
        </button>
      </form>
      <div class="weather-info-container">
        <app-alerts
          *ngIf="currentCoords"
          [coordinates]="currentCoords"
        ></app-alerts>
        <app-current-weather
          [currentWeather]="weather?.current"
        ></app-current-weather>
        <app-hourly-weather
          [hourlyWeather]="weather?.hourly"
        ></app-hourly-weather>
        <app-daily-weather [dailyWeather]="weather?.daily"></app-daily-weather>
        <button>Current Provider (switch providers using this button)</button>
        <p>{{ currentCoords?.lat ?? -1 }}, {{ currentCoords?.lon ?? -1 }}</p>
      </div>
    </main>

    <router-outlet />
  `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'warbler-weather';
  currentCoords: Coordinates | null = null;
  weather: Weather | null = null;

  onFormSubmit(event: Event) {
    event.preventDefault();
  }

  constructor() {
    this.currentCoords = {
      lat: 41.881832,
      lon: -87.623177,
    };

    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      this.currentCoords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      this.getWeather();
    } catch (error) {
      console.error('Error getting current location:', error);
      this.currentCoords = {
        lat: 41.881832,
        lon: -87.623177,
      };
    }
  }

  weatherService: WeatherService = inject(WeatherService);

  async getCoords(text: string) {
    const coords = await this.weatherService.geocode(text);
    this.currentCoords = {
      lat: coords.lat ?? 41.881832,
      lon: coords.lon ?? -87.623177,
    };

    this.getWeather();
  }

  async getWeather() {
    if (!this.currentCoords) {
      return;
    }
    const weather: Weather | null = await this.weatherService.getWeather(
      this.currentCoords
    );

    this.weather = weather;
  }
}
