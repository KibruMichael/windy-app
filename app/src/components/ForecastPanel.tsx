import { useState } from 'react';
import { 
  Search, 
  Wind, 
  Droplets, 
  Eye, 
  Sun, 
  Moon, 
  Navigation,
  Gauge,
  ChevronDown,
  MapPin
} from 'lucide-react';
import type { WeatherData, LocationData } from '@/types/weather';
import { 
  getWeatherIconUrl, 
  formatTime, 
  formatDay, 
  formatDate,
  getWindDirection,
  getUVIndexDescription 
} from '@/services/weatherService';

interface ForecastPanelProps {
  weather: WeatherData | null;
  location: LocationData | null;
  onSearch: (query: string) => void;
  searchResults: LocationData[];
  onSelectLocation: (location: LocationData) => void;
  isLoading: boolean;
}

const ForecastPanel = ({ 
  weather, 
  location, 
  onSearch, 
  searchResults, 
  onSelectLocation,
  isLoading 
}: ForecastPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSearchResults(true);
    }
  };

  const handleSelectLocation = (loc: LocationData) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const toggleDayExpand = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 w-full max-w-md h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#A6B3D0] text-sm">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (!weather || !location) {
    return (
      <div className="glass-panel rounded-2xl p-6 w-full max-w-md h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-[#00F0FF] mx-auto mb-4 opacity-50" />
          <p className="text-[#A6B3D0]">Click on the map or search for a location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl w-full max-w-md h-full flex flex-col overflow-hidden animate-slide-in-right">
      {/* Search Section */}
      <div className="p-5 border-b border-white/5">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6B3D0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            className="search-input pl-11"
          />
        </form>
        
        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-5 right-5 mt-2 glass-panel rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-[#00F0FF]" />
                <div>
                  <p className="text-[#F4F7FF] text-sm font-medium">{result.name}</p>
                  <p className="text-[#A6B3D0] text-xs">
                    {result.state ? `${result.state}, ` : ''}{result.country}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Weather */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#F4F7FF] mb-1">{location.name}</h2>
              <p className="text-[#A6B3D0] text-sm">
                {location.state ? `${location.state}, ` : ''}{location.country}
              </p>
            </div>
            <img 
              src={getWeatherIconUrl(weather.current.icon, '2x')} 
              alt={weather.current.description}
              className="w-16 h-16"
            />
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold text-[#F4F7FF]">{weather.current.temp}°</span>
            <span className="text-[#A6B3D0] text-lg capitalize">{weather.current.description}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#A6B3D0]">H:{weather.daily[0]?.tempMax}°</span>
            <span className="text-[#A6B3D0]">L:{weather.daily[0]?.tempMin}°</span>
            <span className="text-[#A6B3D0]">Feels like {weather.current.feelsLike}°</span>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-semibold text-[#A6B3D0] uppercase tracking-wider mb-4">Hourly</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {weather.hourly.map((hour, index) => (
              <div key={index} className="hourly-card">
                <p className="text-[#A6B3D0] text-xs mb-2">
                  {index === 0 ? 'Now' : formatTime(hour.dt, weather.timezoneOffset)}
                </p>
                <img 
                  src={getWeatherIconUrl(hour.icon)} 
                  alt={hour.description}
                  className="w-8 h-8 mx-auto mb-2"
                />
                <p className="text-[#F4F7FF] font-semibold">{hour.temp}°</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Droplets className="w-3 h-3 text-[#00D4AA]" />
                  <span className="text-[#A6B3D0] text-xs">{hour.pop}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10-Day Forecast */}
        <div className="p-5 border-b border-white/5">
          <h3 className="text-sm font-semibold text-[#A6B3D0] uppercase tracking-wider mb-4">10-Day Forecast</h3>
          <div className="space-y-1">
            {weather.daily.map((day, index) => (
              <div key={index}>
                <div 
                  className="daily-row"
                  onClick={() => toggleDayExpand(index)}
                >
                  <div className="flex items-center gap-4 w-24">
                    <span className="text-[#F4F7FF] text-sm font-medium">{formatDay(day.dt)}</span>
                    <span className="text-[#A6B3D0] text-xs">{formatDate(day.dt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <img 
                      src={getWeatherIconUrl(day.icon)} 
                      alt={day.description}
                      className="w-8 h-8"
                    />
                    <span className="text-[#A6B3D0] text-xs hidden sm:block w-24 capitalize">{day.description}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[#F4F7FF] font-semibold w-8 text-right">{day.tempMax}°</span>
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, #2D5BFF 0%, #FF2D8F 100%)`,
                          width: `${((day.tempMax - day.tempMin) / 40) * 100}%`,
                          marginLeft: `${((day.tempMin + 10) / 50) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-[#A6B3D0] w-8">{day.tempMin}°</span>
                  </div>
                  
                  <ChevronDown 
                    className={`w-4 h-4 text-[#A6B3D0] transition-transform ${expandedDay === index ? 'rotate-180' : ''}`} 
                  />
                </div>
                
                {/* Expanded Details */}
                {expandedDay === index && (
                  <div className="px-4 py-3 bg-white/5 rounded-xl mt-1 mb-2 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-[#00D4AA]" />
                        <span className="text-[#A6B3D0]">Rain: {day.pop}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-[#00F0FF]" />
                        <span className="text-[#A6B3D0]">{day.windSpeed} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-[#FF2D8F]" />
                        <span className="text-[#A6B3D0]">UV: {day.uvi}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-[#A6B3D0] uppercase tracking-wider mb-4">Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-[#00D4AA]" />
                <span className="text-[#A6B3D0] text-sm">Humidity</span>
              </div>
              <p className="text-[#F4F7FF] text-xl font-semibold">{weather.current.humidity}%</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-[#FF2D8F]" />
                <span className="text-[#A6B3D0] text-sm">UV Index</span>
              </div>
              <p className="text-[#F4F7FF] text-xl font-semibold">
                {weather.current.uvi} <span className="text-sm text-[#A6B3D0]">{getUVIndexDescription(weather.current.uvi)}</span>
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-[#A6B3D0] text-sm">Pressure</span>
              </div>
              <p className="text-[#F4F7FF] text-xl font-semibold">{weather.current.pressure} hPa</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#B8C6E8]" />
                <span className="text-[#A6B3D0] text-sm">Visibility</span>
              </div>
              <p className="text-[#F4F7FF] text-xl font-semibold">{weather.current.visibility} km</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-[#A6B3D0] text-sm">Wind</span>
              </div>
              <p className="text-[#F4F7FF] text-xl font-semibold">
                {getWindDirection(weather.current.windDeg)} {weather.current.windSpeed} <span className="text-sm text-[#A6B3D0]">km/h</span>
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-[#B8C6E8]" />
                <span className="text-[#A6B3D0] text-sm">Sunrise/Sunset</span>
              </div>
              <div className="text-[#F4F7FF] text-sm">
                <p>↑ {formatTime(weather.current.sunrise, weather.timezoneOffset)}</p>
                <p>↓ {formatTime(weather.current.sunset, weather.timezoneOffset)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPanel;
