import React, { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = "202d7c1c8b36711fa3f01bd93210205c";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("search")) || []
  );

  const getWeather = async (cityName) => {
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
      );

      const weatherData = weatherRes.data;
      const lat = weatherData.coord.lat;
      const lon = weatherData.coord.lon;

      const uvRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?id=${weatherData.id}&appid=${API_KEY}`
      );

      setWeather({
        name: weatherData.name,
        date: new Date(weatherData.dt * 1000),
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
        temp: k2f(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        wind: weatherData.wind.speed,
        uv: uvRes.data.value,
      });

      const forecastArr = [];
      for (let i = 0; i < 5; i++) {
        const data = forecastRes.data.list[i * 8 + 4];
        forecastArr.push({
          date: new Date(data.dt * 1000),
          icon: data.weather[0].icon,
          temp: k2f(data.main.temp),
          humidity: data.main.humidity,
        });
      }
      setForecast(forecastArr);
    } catch (error) {
      alert("City not found");
    }
  };

  const handleSearch = () => {
    if (!city) return;
    getWeather(city);
    const updatedHistory = [...searchHistory, city];
    setSearchHistory(updatedHistory);
    localStorage.setItem("search", JSON.stringify(updatedHistory));
    setCity("");
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.clear();
  };

  const k2f = (K) => Math.floor((K - 273.15) * 1.8 + 32);

  useEffect(() => {
    if (searchHistory.length > 0) {
      getWeather(searchHistory[searchHistory.length - 1]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white text-center py-4">
        <h1 className="text-3xl font-bold">Weather Dashboard</h1>
      </header>

      <div className="flex flex-col md:flex-row p-6 gap-6">
        {/* Sidebar */}
        <div className="md:w-1/3 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Search for a City:</h2>
          <div className="flex mb-3">
            <input
              type="text"
              placeholder="Enter city"
              className="flex-1 p-2 border rounded-full bg-white"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 rounded-full text-white px-4"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-1 rounded mb-3"
            onClick={clearHistory}
          >
            Clear History
          </button>

          <div>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                className="w-full text-left p-2 bg-gray-100 border mb-1 rounded"
                onClick={() => getWeather(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Info */}
        <div className="md:w-2/3">
          {weather && (
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {weather.name} ({weather.date.toLocaleDateString()})
              </h2>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
              />
              <p>Temperature: {weather.temp}°F</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind Speed: {weather.wind} MPH</p>

            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">5-Day Forecast</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {forecast.map((day, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-r from-blue-300 to-blue-800 text-white p-4 rounded shadow"
                  >
                    <p className="mb-2 font-bold">
                      {day.date.toLocaleDateString()}
                    </p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt="forecast"
                    />
                    <p>Temp: {day.temp}°F</p>
                    <p>Humidity: {day.humidity}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
