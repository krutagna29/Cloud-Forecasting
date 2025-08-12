import "./WeatherForecasting.css";
import clearImage from "../assets/clear.png";
import cloudImage from "../assets/cloud.png";
import drizzleImage from "../assets/drizzle.png";
import humidityImage from "../assets/humidity.png";
import rainImage from "../assets/rain.png";
import snowImage from "../assets/snow.png";
import windImage from "../assets/wind.png";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CloudForecasting = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("Navsari");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const allIcons = {
    "01d": clearImage,
    "02d": cloudImage,
    "03d": cloudImage,
    "04d": cloudImage,
    "09d": rainImage,
    "10d": rainImage,
    "11d": drizzleImage,
    "13d": snowImage,
    "50d": cloudImage,
    "01n": clearImage,
    "02n": cloudImage,
    "03n": cloudImage,
    "04n": cloudImage,
    "09n": rainImage,
    "10n": rainImage,
    "11n": drizzleImage,
    "13n": snowImage,
    "50n": cloudImage,
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      alert("Please enter a city name.");
      return;
    }

    try {
      setLoading(true);
      const apiKey = import.meta.env.VITE_APP_ID;

      const [currentRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`)
      ]);

      const currentData = await currentRes.json();
      const forecastJson = await forecastRes.json();

      if (!currentRes.ok || currentData.cod !== 200) {
        alert(currentData.message || "Unable to fetch weather.");
        setLoading(false);
        return;
      }

      const icon = allIcons[currentData.weather[0].icon] || cloudImage;
      setWeatherData({
        humidity: currentData.main.humidity,
        temperature: Math.round(currentData.main.temp),
        windSpeed: currentData.wind.speed,
        location: currentData.name,
        icon: icon,
      });

      const filteredForecast = forecastJson.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 5)
        .map((item) => ({
          date: new Date(item.dt_txt).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }),
          temp: Math.round(item.main.temp),
          icon: allIcons[item.weather[0].icon] || cloudImage,
        }));

      setForecastData(filteredForecast);
    } catch (error) {
      console.error("Weather fetch error:", error);
      alert("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  return (
    <motion.div
      className={`container weather-glass p-4 rounded-4 ${darkMode ? "text-white" : "text-dark"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toggle Dark Mode */}
      <div className="d-flex justify-content-end mb-3">
        <button
          className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Title */}
      <motion.h1
        className="text-center fw-bold mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Cloud Forecasting
      </motion.h1>

      {/* City Input */}
      <div className="input-group mb-4">
        <input
          type="text"
          className={`form-control ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
          placeholder="Enter your city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
        />
        <button className="btn btn-primary" onClick={() => fetchWeather(city)}>
          <i className="bi bi-search"></i>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Current Weather */}
      {weatherData && !loading && (
        <>
          <motion.div
            className="text-center mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <img src={weatherData.icon} alt="weather" width="100" />
          </motion.div>

          <motion.h2
            className="text-center display-4 mb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {weatherData.temperature}°C
          </motion.h2>
          <motion.h5
            className="text-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {weatherData.location}
          </motion.h5>

          <motion.div
            className="row text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="col-6">
              <img src={humidityImage} alt="Humidity" width="40" />
              <p className="mb-0">{weatherData.humidity}%</p>
              <small>Humidity</small>
            </div>
            <div className="col-6">
              <img src={windImage} alt="Wind" width="40" />
              <p className="mb-0">{weatherData.windSpeed} km/h</p>
              <small>Wind Speed</small>
            </div>
          </motion.div>

          {/* 5-Day Forecast */}
          {forecastData.length > 0 && (
            <motion.div
              className="row justify-content-center forecast-card-wrapper"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.7 },
                },
              }}
            >
              {forecastData.map((day, index) => (
                <motion.div
                  key={index}
                  className="col-6 col-md-2 mb-3 forecast-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="card p-2 text-center border-0">
                    <p className="mb-1">{day.date}</p>
                    <img src={day.icon} alt="forecast" width="40" />
                    <p className="mb-0">{day.temp}°C</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default CloudForecasting;
