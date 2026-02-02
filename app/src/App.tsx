import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import pb from "./lib/pocketbase";
import AuthPanel from "./components/AuthPanel";
import CommentBox from "./components/CommentBox";
import Rating from "./components/Rating";
import Favorites from "./components/Favorites";
import { Star } from "lucide-react";

// Fix Leaflet default marker icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  coord: {
    lat: number;
    lon: number;
  };
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    pop: number;
  }>;
}

type WeatherLayer = "none" | "wind" | "temp" | "rain" | "clouds" | "pressure";

const API_KEY = "93dc7195ba27cb6078c37666ababeedd";

function AppContent() {
  const [position, setPosition] = useState<[number, number]>([
    40.7128, -74.006,
  ]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>("wind");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; country: string; lat: number; lon: number }>
  >([]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=24`,
        ),
      ]);

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
    setLoading(false);
  }, []);

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const selectLocation = (loc: { lat: number; lon: number }) => {
    setPosition([loc.lat, loc.lon]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const saveFavorite = async () => {
    if (!user || !weather) return;
    try {
      await pb.collection("favorites").create({
        locationName: weather.name,
        coordinates: `${position[0]},${position[1]}`,
        user: user.id,
      });
      alert("Added to favorites!");
    } catch (error) {
      console.error("Error saving favorite:", error);
      alert("Already in favorites or error occurred.");
    }
  };

  useEffect(() => {
    fetchWeatherData(position[0], position[1]);
  }, [position, fetchWeatherData]);

  const getWeatherIconUrl = (icon: string) =>
    `https://openweathermap.org/img/wn/${icon}@2x.png`;

  const getLayerUrl = (layer: WeatherLayer) => {
    if (layer === "none" || layer === "wind") return null;
    const layerMap: Record<string, string> = {
      temp: "temp_new",
      rain: "precipitation_new",
      clouds: "clouds_new",
      pressure: "pressure_new",
    };
    return `https://tile.openweathermap.org/map/${layerMap[layer]}/{z}/{x}/{y}.png?appid=${API_KEY}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  };

  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getWindDirection = (deg: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return directions[Math.round(deg / 22.5) % 16];
  };

  const layerUrl = getLayerUrl(activeLayer);

  const { user, logout } = useAuth();

  // Get daily forecast (every 8th item = every 24 hours)
  const dailyForecast =
    forecast?.list.filter((_, i) => i % 8 === 0).slice(0, 5) || [];

  return (
    <div className="app">
      {/* Map */}
      <div className="map-wrapper">
        <MapContainer center={position} zoom={5} className="map">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
            subdomains="abcd"
          />
          {/* Removed Compact attribution control */}
          {layerUrl && (
            <TileLayer url={layerUrl} opacity={0.6} className="weather-layer" />
          )}
          <Marker position={position} />
          <MapClickHandler />
        </MapContainer>

        {/* Layer Controls */}
        <div className="layer-controls">
          {(
            ["wind", "temp", "rain", "clouds", "pressure"] as WeatherLayer[]
          ).map((layer) => (
            <button
              key={layer}
              className={`layer-btn ${activeLayer === layer ? "active" : ""}`}
              onClick={() =>
                setActiveLayer(activeLayer === layer ? "none" : layer)
              }
            >
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={() => {}}>+</button>
          <button onClick={() => {}}>-</button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* User / Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ color: "#A6B3D0", fontSize: 13 }}>
            {user?.email || "User"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                logout();
              }}
              className="layer-btn"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchLocation(searchQuery)}
            placeholder="Search city..."
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  className="search-result"
                  onClick={() => selectLocation(result)}
                >
                  {result.name}, {result.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <div className="loading">Loading...</div>}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => {
              logout();
            }}
            className="layer-btn"
          >
            Logout
          </button>
        </div>

        {weather && (
          <>
            {/* Current Weather */}
            <div className="current-weather">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>{weather.name}</h2>
                <button 
                  onClick={saveFavorite}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    color: "#FFD700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  title="Save to favorites"
                >
                  <Star size={20} />
                </button>
              </div>
              <div className="temp-row">
                <img src={getWeatherIconUrl(weather.weather[0].icon)} alt="" />
                <span className="temp">{Math.round(weather.main.temp)}°</span>
              </div>
              <p className="description">{weather.weather[0].description}</p>
              <div className="high-low">
                H: {Math.round(weather.main.temp_max)}° L:{" "}
                {Math.round(weather.main.temp_min)}°
              </div>
              <div className="feels-like">
                Feels like {Math.round(weather.main.feels_like)}°
              </div>
            </div>

            {/* Hourly Forecast */}
            {forecast && (
              <div className="hourly-forecast">
                <h3>Hourly Forecast</h3>
                <div className="hourly-scroll">
                  {forecast.list.slice(0, 8).map((item, i) => (
                    <div key={i} className="hour-item">
                      <span>{i === 0 ? "Now" : formatTime(item.dt)}</span>
                      <img
                        src={getWeatherIconUrl(item.weather[0].icon)}
                        alt=""
                      />
                      <span>{Math.round(item.main.temp)}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {dailyForecast.length > 0 && (
              <div className="daily-forecast">
                <h3>5-Day Forecast</h3>
                {dailyForecast.map((day, i) => (
                  <div key={i} className="day-item">
                    <span className="day-name">{formatDay(day.dt)}</span>
                    <img src={getWeatherIconUrl(day.weather[0].icon)} alt="" />
                    <div className="temp-bar">
                      <span className="high">
                        {Math.round(day.main.temp_max)}°
                      </span>
                      <div className="temp-line"></div>
                      <span className="low">
                        {Math.round(day.main.temp_min)}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="details">
              <h3>Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Humidity</span>
                  <span className="value">{weather.main.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Wind</span>
                  <span className="value">
                    {getWindDirection(weather.wind.deg)}{" "}
                    {Math.round(weather.wind.speed * 3.6)} km/h
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Pressure</span>
                  <span className="value">{weather.main.pressure} hPa</span>
                </div>
                <div className="detail-item">
                  <span className="label">Visibility</span>
                  <span className="value">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Clouds</span>
                  <span className="value">{weather.clouds.all}%</span>
                </div>
                <div className="detail-item">
                  <span className="label">Sunrise/Sunset</span>
                  <span className="value">
                    {formatTime(weather.sys.sunrise)} /{" "}
                    {formatTime(weather.sys.sunset)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="sidebar-attribution">
          © OpenStreetMap contributors © CARTO
        </div>
        <Favorites onSelect={(lat, lon) => setPosition([lat, lon])} />
        <CommentBox currentLocation={weather?.name} />
        <Rating />
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
};

const AppRoot: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Checking auth...</div>;
  if (!user) return <AuthPanel />;

  return <AppContent />;
};

export default App;
