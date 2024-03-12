export interface Weather {
  current: Current;
  hourly: Hourly;
  daily: Daily;
}

export interface Current {
  time: string;
  temp: string;
  wind: string;
  humidity: number;
  condition: string;
  icon: string;
  code: number;
}

export interface Hourly {
  hours: Hour[];
}

export interface Hour {
  time: string;
  icon: string;
  temp: string;
  precipitation: number;
}

export interface Daily {
  days: Day[];
}

export interface Day {
  minTemp: string;
  maxTemp: string;
  date: string;
  day: string;
  icon: string;
  condition: string;
  precipitation: number;
}
