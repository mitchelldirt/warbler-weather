import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  readonly baseWeatherApiUrl = 'http://api.weatherapi.com/v1';

  constructor() {}

  async geocode(location: string) {
    const data = await fetch(
      `${this.baseWeatherApiUrl}/search.json?key=${environment.weatherApiKey}&q=${location}`
    );

    const results = (await data.json()) ?? [];

    if (results.length > 0) {
      let location = results[0];

      return {
        lat: location.lat,
        lon: location.lon,
      };
    }

    return {};
  }

  getAlerts() {}
}
