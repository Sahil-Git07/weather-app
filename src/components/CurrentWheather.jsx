import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Loader from './Loader';
import defaultWeatherImg from '../assets/default_image.jpg';
import { FaSearchLocation, FaTemperatureHigh, FaWind, FaRegClock } from 'react-icons/fa';
import { WiHumidity, WiStrongWind, WiDaySunny, WiRain, WiCloudy, WiDust, WiSmoke, WiDaySunnyOvercast } from 'react-icons/wi';
import { MdKeyboardVoice } from "react-icons/md";

const CurrentWeather = () => {
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [airPollution, setAirPollution] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [loading, setLoading ] = useState(true);
  const [listening, setListening] = useState(false)

  const API_KEY = "use yours";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          };
          setLocation(coords);
          fetchAllWeatherData(coords.latitude, coords.longitude);
        },
        () => console.log('Error getting location')
      );
    }
  }, []);

  const fetchAllWeatherData = async (lat, lon) => {
    try {
      setLoading(true)
      const [weatherRes, forecastRes, pollutionRes, uvRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      ]);

      const [weatherData, forecastData, pollutionData, uvData] = await Promise.all([
        weatherRes.json(),
        forecastRes.json(),
        pollutionRes.json(),
        uvRes.json()
      ]);

      setWeatherData(mapWeatherData(weatherData));
      setForecastData(forecastData);
      setAirPollution(pollutionData.list[0]);
      setUvIndex(uvData.value);
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch weather data:", error);
    }
  };

const fetchCityWeather = async (spokenCity = city) => {
  try {
    setLoading(true);
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${spokenCity}&limit=1&appid=${API_KEY}`);
    const geoData = await geoRes.json();

    if (geoData.length === 0) {
      alert("City not found");
      setLoading(false);
      return;
    }

    const { lat, lon } = geoData[0];
    setLocation({ latitude: lat, longitude: lon });
    await fetchAllWeatherData(lat, lon);
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch city weather:", error);
    setLoading(false);
  }
};


  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchCityWeather();
    }
  };

  const handleVoiceSearch = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Your browser does not support speech recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setListening(true);
    console.log("Listening...");
  };

  recognition.onresult = (event) => {
    console.log(event)
    const transcript = event.results[0][0].transcript;
    console.log("Voice Input:", transcript);
    
    const matched = transcript.match(/weather in (.+)/i);
    const spokenCity = matched ? matched[1] : transcript;

    setCity(spokenCity);
    fetchCityWeather(spokenCity);  
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    setListening(false);
  };

  recognition.start();
};


  const mapWeatherData = (data) => ({
    name: data.name,
    temp: data.main.temp,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    feels_like: data.main.feels_like,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    weather_main: data.weather[0].main,
    weather_description: data.weather[0].description,
    icon: data.weather[0].icon,
    time: new Date(data.dt * 1000).toLocaleTimeString()
  });

const weatherBackground = {
  Clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b",
  Clouds: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
  Rain: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6",
  Drizzle: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  Thunderstorm: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7",
  Snow: "https://images.unsplash.com/photo-1541739449311-3a8b8cbf1112",
  Mist: "https://images.unsplash.com/photo-1609941883149-f1955903ab87",
  Fog: "https://images.unsplash.com/photo-1505577058444-a3dab90d4253",
  Haze: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa",
  Smoke: "https://images.unsplash.com/photo-1581606787359-29a2b618fd6e",
  Dust: "https://images.unsplash.com/photo-1618826413811-0f78a42957e1",
  Sand: "https://images.unsplash.com/photo-1609696864260-2aeb3f008097",
  Tornado: "https://images.unsplash.com/photo-1525518006378-58e82d2f2d4a",
  Squall: "https://images.unsplash.com/photo-1554481928-3198e6f7fa9a",
  Default: defaultWeatherImg,
};

  const getSuggestion = (main) => {
    switch(main) {
      case 'Rain': return "Carry an umbrella and wear waterproof clothes.";
      case 'Clear': return "Perfect time for a walk or outdoor activities!";
      case 'Clouds': return "Might be gloomy, good time to read or relax indoors.";
      case 'Snow': return "Dress warmly and avoid slippery roads.";
      default: return "Stay prepared and check local alerts.";
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
    
    <div className="weather-app">
      <div className="top-section">
        <div className="left-panel">
          {weatherData && (
            <>
              <img className="weather-bg" src={weatherBackground[weatherData.weather_main] || weatherBackground.Default} alt="Weather" />
              <div className="overlay">
                <h1>{weatherData.name}</h1>
                <p><FaRegClock /> {weatherData.time}</p>
                <p><FaTemperatureHigh /> {weatherData.temp} °C</p>
              </div>
            </>
          )}
        </div>

        <div className="right-panel">
          <div className="search-box">
            <input type="text" value={city} placeholder="Search city..."
              onChange={(e) => setCity(e.target.value)} onKeyDown={handleKeyDown} />
            <FaSearchLocation onClick={fetchCityWeather} />
            <MdKeyboardVoice  onClick={handleVoiceSearch}/>
          </div>

          {weatherData && (
            <div className="right-details">
              <div className='right-details-subsection'>
               <h2>{weatherData.weather_main}</h2>
              <p>Min Temp: {weatherData.temp_min} °C</p>
              <p>Max Temp: {weatherData.temp_max} °C</p>
              <p>Feels Like: {weatherData.feels_like} °C</p>
              </div>

              <div >
              <p><WiHumidity /> Humidity: {weatherData.humidity}%</p>
              <p><WiStrongWind /> Wind: {weatherData.wind_speed} m/s</p>
              <p><WiDust /> Air Quality Index: {airPollution?.main.aqi}</p>
              <p><WiDaySunnyOvercast /> UV Index: {uvIndex}</p>
              </div>
             
            </div>
          )}
        </div>
      </div>

      <div className="bottom-section">
        <div className="suggestion-box">
          <h3>Weather Suggestions</h3>
          <p>{getSuggestion(weatherData?.weather_main)}</p>
        </div>

        {forecastData && forecastData.list && (
          <div className="forecast-section">
            <h3>Upcoming Forecast</h3>
            <div className="forecast-grid">
              {forecastData.list.slice(0, 6).map((forecast, index) => {
                const date = new Date(forecast.dt * 1000);
                const hours = date.getHours();
                const time = `${hours}:00`;
                const iconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
                const temp = Math.round(forecast.main.temp);

                return (
                  <div key={index} className="forecast-card">
                    <p>{time}</p>
                    <img src={iconUrl} alt={forecast.weather[0].main} />
                    <p>{forecast.weather[0].main}</p>
                    <p>{temp} °C</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default CurrentWeather;
