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

      let locationName =
        location.country == 'United States of America'
          ? `${location.name}, ${location.region}`
          : `${location.name}, ${location.country}`;

      return {
        lat: location.lat,
        lon: location.lon,
        name: locationName,
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

  async getWeather(
    coordinates: Coordinates,
    units: 'imperial' | 'metric' | null = 'imperial'
  ): Promise<Weather | null> {
    const data = await fetch(
      `${this.baseWeatherApiUrl}/forecast.json?key=${environment.weatherApiKey}&q=${coordinates.lat},${coordinates.lon}&days=6&aqi=no&alerts=no`
    );

    if (data.ok) {
      const result: Forecast = await data.json();
      let wind: string;
      let temp: string;
      let time: string;

      if (units === 'metric') {
        wind = this.convertToKilometersPerHour(result.current.wind_mph);
        temp = this.convertToCelsius(result.current.temp_f);
        time = result.location.localtime.split(' ')[1];
      } else {
        wind = result.current.wind_mph.toFixed(0) + ' mph';
        temp = result.current.temp_f.toFixed(0) + '°F';
        let metricTime = result.location.localtime.split(' ')[1];
        time = this.convertToImperialTime(metricTime);
      }

      const current: Current = {
        temp: temp,
        condition: result.current.condition.text,
        icon: result.current.condition.icon.split('//')[1],
        wind: wind,
        humidity: result.current.humidity,
        time: time,
        code: result.current.condition.code,
      };

      const hourNow = new Date().getHours();
      const hourly = result.forecast.forecastday[0].hour
        .slice(hourNow + 1, hourNow + 9)
        .filter((hour: ResponseHour) => hour.time !== '')
        .map((hour: ResponseHour): Hour => {
          if (units === 'metric') {
            return {
              time: hour.time.split(' ')[1],
              icon: hour.condition.icon.split('//')[1],
              temp: this.convertToCelsius(hour.temp_f),
              precipitation: hour.chance_of_rain,
            };
          }

          return {
            time: this.convertToImperialTime(hour.time.split(' ')[1]),
            icon: hour.condition.icon.split('//')[1],
            temp: Number(hour.temp_f.toFixed(0)) + '°F',
            precipitation: hour.chance_of_rain,
          };
        });

      if (hourNow + 9 > 24) {
        const nextDay = result.forecast.forecastday[1].hour
          .slice(0, 9 - (24 - hourNow))
          .map((hour: ResponseHour): Hour => {
            if (units === 'metric') {
              return {
                time: hour.time.split(' ')[1],
                icon: hour.condition.icon.split('//')[1],
                temp: this.convertToCelsius(hour.temp_f),
                precipitation: hour.chance_of_rain,
              };
            }

            return {
              time: this.convertToImperialTime(hour.time.split(' ')[1]),
              icon: hour.condition.icon.split('//')[1],
              temp: Number(hour.temp_f.toFixed(0)) + '°F',
              precipitation: hour.chance_of_rain,
            };
          });

        hourly.push(...nextDay);
      }

      const daily = result.forecast.forecastday
        .slice(1)
        .map((day: Forecastday): Day => {
          const dayName = new Date(day.date)
            .toLocaleString('en-US', {
              weekday: 'long',
            })
            .slice(0, 3)
            .toUpperCase();

          // grab the month/day from day.date formatted as MM/DD
          const monthDay = new Date(day.date).toLocaleString(
            units === 'imperial' ? 'en-US' : 'en-UK',
            {
              month: 'numeric',
              day: 'numeric',
            }
          );

          if (units === 'metric') {
            return {
              minTemp: this.convertToCelsius(day.day.mintemp_f).split('°')[0],
              maxTemp: this.convertToCelsius(day.day.maxtemp_f).split('°')[0],
              date: monthDay,
              day: dayName,
              icon: day.day.condition.icon.split('//')[1],
              condition: day.day.condition.text,
              precipitation: day.day.daily_chance_of_rain,
            };
          }

          return {
            minTemp: day.day.mintemp_f.toFixed(0),
            maxTemp: day.day.maxtemp_f.toFixed(0),
            date: monthDay,
            day: dayName,
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

  convertToCelsius(fahrenheit: number) {
    return (((fahrenheit - 32) * 5) / 9).toFixed(0) + '°C';
  }

  convertToKilometersPerHour(mph: number) {
    return (mph * 1.60934).toFixed(0) + ' km/h';
  }

  convertToImperialTime(metricTime: string) {
    let time: string;

    if (Number(metricTime.split(':')[0]) > 12) {
      let hour = Number(metricTime.split(':')[0]) - 12;
      time = hour.toFixed(0) + ':' + metricTime.split(':')[1] + ' PM';
    } else if (Number(metricTime.split(':')[0]) === 12) {
      time = metricTime + ' PM';
    } else {
      if (metricTime.split(':')[0] === '00') {
        time = '12:00 AM';
      } else {
        time = metricTime + ' AM';
      }
    }

    return time;
  }
}
