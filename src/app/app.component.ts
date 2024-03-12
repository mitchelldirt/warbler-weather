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
        <h1>WARBLER 🪶</h1>
        <app-settings
          (changeUnits)="toggleUnits()"
          (getCurrentLocation)="getCurrentLocation()"
          class="settings"
        ></app-settings>
      </header>
      <form
        (ngSubmit)="onFormSubmit($event); (false)"
        class="location-search-form"
      >
        <input
          placeholder="Search your Address, City, or Zip Code"
          type="text"
          value="{{ locationName }}"
          class="search-icon location-search-input"
          #filter
        />
        <button
          style="display: none;"
          type="submit"
          (click)="getCoords(filter.value)"
        >
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
  locationName: string | undefined = undefined;
  units: 'imperial' | 'metric' | null = null;

  onFormSubmit(event: Event) {
    event.preventDefault();
  }

  constructor() {
    // check if the user has a location saved in local storage
    const localCoords = localStorage.getItem('coords');

    if (localCoords) {
      this.currentCoords = JSON.parse(localCoords ?? '');
    } else {
      this.currentCoords = {
        lat: 42.96,
        lon: -85.67,
      };
    }

    const localUnits = localStorage.getItem('units');

    if (localUnits && (localUnits === 'imperial' || localUnits === 'metric')) {
      this.units = localUnits;
    } else {
      this.units = 'imperial';
    }

    if (this.currentCoords && this.units) {
      this.getCoords(`${this.currentCoords.lat}, ${this.currentCoords.lon}`);
    } else {
      this.getCurrentLocation();
    }
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

      this.getCoords(`${this.currentCoords.lat}, ${this.currentCoords.lon}`);
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

    localStorage.setItem('coords', JSON.stringify(this.currentCoords));

    this.locationName = coords.name;

    await this.getWeather();
  }

  async getWeather() {
    if (!this.currentCoords) {
      return;
    }
    const weather: Weather | null = await this.weatherService.getWeather(
      this.currentCoords,
      this.units
    );

    this.weather = weather;

    if (weather) {
      console.log(weather.current.condition);
      console.log(document.documentElement.getAttribute('data-theme'));
      this.setColorTheme(
        weather.current.condition.trim(),
        weather.current.code
      );
      console.log(document.documentElement.getAttribute('data-theme'));
    }
  }

  toggleUnits() {
    this.units = this.units === 'imperial' ? 'metric' : 'imperial';
    localStorage.setItem('units', this.units);
    this.getWeather();
  }

  setColorTheme(condition: string, weatherCode: number) {
    if (condition === 'Clear') {
      document.documentElement.setAttribute('data-theme', 'night');
      return;
    }

    if (condition === 'Sunny') {
      document.documentElement.setAttribute('data-theme', 'day');
      return;
    }

    const cloudyCodes = [1003, 1006, 1009, 1030, 1135, 1147];

    const snowyCodes = [
      1066, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237,
      1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
    ];

    const rainyCodes = [
      1063, 1069, 1072, 1087, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189,
      1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276,
    ];

    if (cloudyCodes.includes(weatherCode)) {
      document.documentElement.setAttribute('data-theme', 'cloudy');
      return;
    }

    if (snowyCodes.includes(weatherCode)) {
      document.documentElement.setAttribute('data-theme', 'snowy');
      return;
    }

    if (rainyCodes.includes(weatherCode)) {
      document.documentElement.setAttribute('data-theme', 'rainy');
      return;
    }
  }
}
