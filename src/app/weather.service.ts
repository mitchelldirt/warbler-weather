import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Coordinates } from './coordinates';
import { Alert } from './alert';
import { Current, Day, Weather } from './weather';
import {
  Day as ResponseDay,
  Forecast,
  Hour as ResponseHour,
  Forecastday,
} from './forecast';
import { Hour } from './weather';

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

  private async getAlertsZone(lat: number, lon: number) {
    const data = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
    const results = (await data.json()) ?? null;

    if (results) {
      return results.properties.county.split('county/')[1];
    }

    return {};
  }

  // I think I might need to call getAlertsZone within here
  async getAlerts(coordinates: Coordinates): Promise<Alert[]> {
    let alerts: Alert[] = [];
    const zone = await this.getAlertsZone(coordinates.lat, coordinates.lon);

    const data = await fetch(
      `https://api.weather.gov/alerts/active?zone=${zone}`
    );
    const results = (await data.json()) ?? null;

    // We only care about alerts of severity (extreme, severe, and moderate)
    // results.filter based on severity
    const features = results.features.filter((alert: any) => {
      return ['Moderate', 'Severe', 'Extreme'].includes(
        alert.properties.severity
      );
    });

    if (features.length > 0) {
      features.forEach((feature: any) => {
        let alert: Alert = {
          severity: feature.properties.severity,
          headline: feature.properties.headline,
          instruction: feature.properties.instruction,
        };

        alerts.push(alert);
      });
    }

    return alerts;
  }

  async getWeather(coordinates: Coordinates): Promise<Weather | null> {
    const data = await fetch(
      `${this.baseWeatherApiUrl}/forecast.json?key=${environment.weatherApiKey}&q=${coordinates.lat},${coordinates.lon}&days=5&aqi=no&alerts=no`
    );

    if (data.ok) {
      const result: Forecast = await data.json();

      const current: Current = {
        temp: result.current.temp_f,
        condition: result.current.condition.text,
        icon: result.current.condition.icon.split('//')[1],
        wind: result.current.wind_mph,
        humidity: result.current.humidity,
        time: result.location.localtime,
      };

      const hourly = result.forecast.forecastday[0].hour.map(
        (hour: ResponseHour): Hour => {
          return {
            time: hour.time,
            icon: hour.condition.icon.split('//')[1],
            temp: hour.temp_f,
            precipitation: hour.chance_of_rain,
          };
        }
      );

      const daily = result.forecast.forecastday.map((day: Forecastday): Day => {
        return {
          minTemp: day.day.mintemp_f,
          maxTemp: day.day.maxtemp_f,
          date: day.date,
          icon: day.day.condition.icon.split('//')[1],
          condition: day.day.condition.text,
          precipitation: day.day.daily_chance_of_rain,
        };
      });

      return {
        current,
        hourly: { hours: hourly },
        daily: { days: daily },
      };
    }

    return null;
  }

  // If the user chooses OpenWeather then use this in tandem with the getWeather
  // function. Not implemented yet.

  // First callthe getWeather function. Then replace the property current with the result of the API call to the OpenWeather API
  async getOpenWeather(coordinates: Coordinates): Promise<Weather | null> {
    return null;
  }
}
