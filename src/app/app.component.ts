import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { AlertsComponent } from './alerts/alerts.component';
import { CurrentWeatherComponent } from './current-weather/current-weather.component';
import { HourlyWeatherComponent } from './hourly-weather/hourly-weather.component';
import { DailyWeatherComponent } from './daily-weather/daily-weather.component';
import { WeatherService } from './weather.service';

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
  ],
  template: `
    <main>
      <header class="header">
        <h1>Warbler</h1>
        <app-settings class="settings"></app-settings>
      </header>
      <form>
        <div>
          <button type="button">
            <img src="../assets/location.svg" alt="get my location icon" />
          </button>

          <input
            placeholder="Search your Address, City, or Zip Code"
            type="text"
            #filter
          />
          <button (click)="getCoords(filter.value)" type="button">
            <img
              src="../assets/search.svg"
              alt="search icon"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>
      <app-alerts></app-alerts>
      <app-current-weather></app-current-weather>
      <app-hourly-weather></app-hourly-weather>
      <app-daily-weather></app-daily-weather>
      <button>Current Provider (switch providers using this button)</button>
      <p>{{ lat }}, {{ lon }}</p>
    </main>

    <router-outlet />
  `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'warbler-weather';
  lat = 0;
  lon = 0;

  weatherService: WeatherService = inject(WeatherService);

  async getCoords(text: string) {
    const coords = await this.weatherService.geocode(text);
    this.lat = coords.lat ?? -1;
    this.lon = coords.lon ?? -1;
  }
}
