import axios from 'axios';
import type { WeatherData, LocationData, CurrentWeather, HourlyForecast, DailyForecast } from '@/types/weather';

const API_KEY = '93dc7195ba27cb6078c37666ababeedd';
const BASE_URL = 'https://api.openweathermap.org/data/3.0';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export class WeatherService {
  static async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${BASE_URL}/onecall`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
          exclude: 'minutely,alerts'
        }
      });

      const data = response.data;

      return {
        current: this.parseCurrentWeather(data.current),
        hourly: data.hourly.slice(0, 24).map(this.parseHourlyForecast),
        daily: data.daily.slice(0, 10).map(this.parseDailyForecast),
        timezone: data.timezone,
        timezoneOffset: data.timezone_offset
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  }

  static async searchLocation(query: string): Promise<LocationData[]> {
    try {
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: API_KEY
        }
      });

      return response.data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }

  static async getLocationName(lat: number, lon: number): Promise<LocationData> {
    try {
      const response = await axios.get(`${GEO_URL}/reverse`, {
        params: {
          lat,
          lon,
          limit: 1,
          appid: API_KEY
        }
      });

      const item = response.data[0];
      return {
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      };
    } catch (error) {
      console.error('Error getting location name:', error);
      return {
        name: 'Unknown Location',
        country: '',
        lat,
        lon
      };
    }
  }

  static getWeatherTileUrl(layer: string): string {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}`;
  }

  private static parseCurrentWeather(data: any): CurrentWeather {
    return {
      temp: Math.round(data.temp),
      feelsLike: Math.round(data.feels_like),
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: Math.round(data.wind_speed * 3.6), // Convert m/s to km/h
      windDeg: data.wind_deg,
      visibility: Math.round((data.visibility || 10000) / 1000),
      uvi: Math.round(data.uvi),
      clouds: data.clouds,
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
      sunrise: data.sunrise,
      sunset: data.sunset
    };
  }

  private static parseHourlyForecast(data: any): HourlyForecast {
    return {
      dt: data.dt,
      temp: Math.round(data.temp),
      feelsLike: Math.round(data.feels_like),
      humidity: data.humidity,
      windSpeed: Math.round(data.wind_speed * 3.6),
      windDeg: data.wind_deg,
      pop: Math.round((data.pop || 0) * 100),
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d'
    };
  }

  private static parseDailyForecast(data: any): DailyForecast {
    return {
      dt: data.dt,
      tempMin: Math.round(data.temp.min),
      tempMax: Math.round(data.temp.max),
      tempDay: Math.round(data.temp.day),
      tempNight: Math.round(data.temp.night),
      humidity: data.humidity,
      windSpeed: Math.round(data.wind_speed * 3.6),
      windDeg: data.wind_deg,
      pop: Math.round((data.pop || 0) * 100),
      description: data.weather[0]?.description || 'Unknown',
      icon: data.weather[0]?.icon || '01d',
      sunrise: data.sunrise,
      sunset: data.sunset,
      uvi: Math.round(data.uvi)
    };
  }
}

export const getWeatherIconUrl = (iconCode: string, size: '1x' | '2x' | '4x' = '2x'): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
};

export const formatTime = (timestamp: number, timezoneOffset: number = 0): string => {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    hour12: true 
  });
};

export const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
};

export const getUVIndexDescription = (uvi: number): string => {
  if (uvi <= 2) return 'Low';
  if (uvi <= 5) return 'Moderate';
  if (uvi <= 7) return 'High';
  if (uvi <= 10) return 'Very High';
  return 'Extreme';
};
