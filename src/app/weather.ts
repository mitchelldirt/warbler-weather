export interface Weather {
  current: Current;
  hourly: Hourly;
  daily: Daily;
}

export interface Current {
  time: string;
  temp: number;
  wind: number;
  humidity: number;
  condition: string;
  icon: string;
}

export interface Hourly {
  hours: Hour[];
}

export interface Hour {
  time: string;
  icon: string;
  temp: number;
  precipitation: number;
}

export interface Daily {
  days: Day[];
}

export interface Day {
  minTemp: number;
  maxTemp: number;
  date: string;
  icon: string;
  condition: string;
  precipitation: number;
}
