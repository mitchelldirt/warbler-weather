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
import { OpenForecast } from './open-forecast';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  readonly baseWeatherApiUrl = 'https://api.weatherapi.com/v1';

  constructor() {}

  async geocode(location: string) {
    const data = await fetch(
      `${this.baseWeatherApiUrl}/search.json?key=${environment.weatherApiKey}&q=${location}`,
      { mode: 'cors' }
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
    const data = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
      mode: 'cors',
    });
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
      `https://api.weather.gov/alerts/active?zone=${zone}`,
      { mode: 'cors' }
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
    units: 'imperial' | 'metric' | null = 'imperial',
    currentWeatherProvider: 'weatherapi' | 'openweather' = 'weatherapi'
  ): Promise<Weather | null> {
    const data = await fetch(
      `${this.baseWeatherApiUrl}/forecast.json?key=${environment.weatherApiKey}&q=${coordinates.lat},${coordinates.lon}&days=6&aqi=no&alerts=no`,
      { mode: 'cors' }
    );

    let openWeatherData;

    if (currentWeatherProvider === 'openweather') {
      openWeatherData = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${environment.openWeatherApiKey}`,
        { mode: 'cors' }
      );
    }

    if (data.ok && units !== null) {
      const result: Forecast = await data.json();

      let current;

      if (
        currentWeatherProvider === 'openweather' &&
        openWeatherData &&
        openWeatherData.ok
      ) {
        const currentWeatherResult: OpenForecast = await openWeatherData.json();
        current = this.extractOpenWeatherCurrentWeather(
          currentWeatherResult,
          units,
          result.current.condition.icon
        );
      } else {
        current = this.extractCurrentWeather(result, units);
      }

      console.log('hourly below');
      const hourly = this.extractHourlyWeather(result, units);
      const daily = this.extractDailyWeather(result, units);

      return {
        current,
        hourly: { hours: hourly.hours },
        daily: { days: daily.days },
      };
    }

    return null;
  }

  extractCurrentWeather(result: Forecast, units: 'imperial' | 'metric') {
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

    return {
      temp: temp,
      condition: result.current.condition.text,
      icon: result.current.condition.icon.split('//')[1],
      wind: wind,
      humidity: result.current.humidity,
      time: time,
      code: result.current.condition.code,
    };
  }

  extractOpenWeatherCurrentWeather(
    result: OpenForecast,
    units: 'imperial' | 'metric',
    icon: string
  ) {
    let wind: string;
    let temp: string;
    let time: string;

    console.log(new Date(result.dt * 1000 + result.timezone * 1000)); // plus

    const date = new Date();
    const localTime = date.getTime();
    const utcTime = localTime + date.getTimezoneOffset() * 60000; // Convert local time to UTC
    const requestedCityTime = utcTime + result.timezone * 1000; // Add the requested timezone offset to UTC
    const requestedCityDate = new Date(requestedCityTime);
    time = requestedCityDate
      .toLocaleTimeString('en-UK', {
        hour: 'numeric',
        minute: 'numeric',
      })
      .split(' ')[0];
    if (units === 'metric') {
      wind = this.convertToKilometersPerHour(result.wind.speed);
      temp = this.convertToCelsius(result.main.temp);

      // time = new Date(result.dt * 1000).toLocaleTimeString('en-US', {
      //   hour: 'numeric',
      //   minute: 'numeric',
      // });
    } else {
      wind = result.wind.speed.toFixed(0) + ' mph';
      temp = result.main.temp.toFixed(0) + '°F';
      time = this.convertToImperialTime(time);
    }
    let condition = result.weather[0].description;

    if (result.weather[0].icon.includes('n') && result.weather[0].id === 800) {
      condition = 'Clear';
    }

    if (result.weather[0].icon.includes('d') && result.weather[0].id === 800) {
      condition = 'Sunny';
    }

    return {
      temp: temp,
      condition: condition,
      icon: icon.split('//')[1],
      wind: wind,
      humidity: result.main.humidity,
      time: time,
      code: result.weather[0].id,
    };
  }

  extractHourlyWeather(result: Forecast, units: 'imperial' | 'metric') {
    if (result.location.localtime.split(' ')[1][0] !== '0') {
      result.location.localtime =
        result.location.localtime.slice(0, 11) +
        '0' +
        result.location.localtime.slice(11);
    }

    const hourNow = new Date(result.location.localtime).getHours();
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

    return { hours: hourly };
  }

  extractDailyWeather(result: Forecast, units: 'imperial' | 'metric') {
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

    return { days: daily };
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
