export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  visibility: number;
  uvi: number;
  clouds: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pop: number;
  description: string;
  icon: string;
}

export interface DailyForecast {
  dt: number;
  tempMin: number;
  tempMax: number;
  tempDay: number;
  tempNight: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  pop: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  uvi: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  timezoneOffset: number;
}

export interface LocationData {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export type WeatherLayer = 'wind' | 'temp' | 'rain' | 'clouds' | 'radar' | 'waves' | 'none';

export interface WindParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  speed: number;
}
