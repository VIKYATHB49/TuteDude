const API_KEY = "82a7570434ea65c4a36d563f3e36b218";
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/weather?units=metric";
const API_URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast?units=metric";

// DOM Elements
const temperatureEl = document.getElementById('temperature');
const locationEl = document.getElementById('location');
const sunriseTimeEl = document.getElementById('sunrise-time');
const sunsetTimeEl = document.getElementById('sunset-time');
const humidityEl = document.getElementById('humidity');
const forecastTable = document.getElementById('forecast-table').querySelector('tbody');
const weatherContainer = document.querySelector('.weather-container');
const searchBar = document.getElementById("search-input");
const searchBtn = document.getElementById("search-button");
const reloadButton = document.getElementById('reload-button');
const autoSuggestBox = document.getElementById('auto-suggest');

// State
let currentCity = null;

// Event Listeners
searchBtn.addEventListener("click", handleSearch);
reloadButton.addEventListener("click", handleReload);
searchBar.addEventListener("input", handleAutoSuggest);
searchBar.addEventListener("focus", handleAutoSuggest);
searchBar.addEventListener("blur", () => setTimeout(() => autoSuggestBox.classList.remove("visible"), 200));

// Initial load
getUserLocation();

// Fetch user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => fetchWeatherByCoords(position.coords),
            showError
        );
    } else {
        locationEl.textContent = "Geolocation not supported";
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords({ latitude: lat, longitude: lon }) {
    try {
        const weatherResponse = await fetch(`${API_URL_WEATHER}&lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const weatherData = await weatherResponse.json();
        updateWeatherData(weatherData);

        const forecastResponse = await fetch(`${API_URL_FORECAST}&lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
    } catch (error) {
        handleDataError();
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        startLoading();

        const weatherResponse = await fetch(`${API_URL_WEATHER}&q=${city}&appid=${API_KEY}`);
        if (!weatherResponse.ok) throw new Error('City not found');
        const weatherData = await weatherResponse.json();
        updateWeatherData(weatherData);

        const forecastResponse = await fetch(`${API_URL_FORECAST}&q=${city}&appid=${API_KEY}`);
        if (!forecastResponse.ok) throw new Error('Forecast not available');
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
    } catch (error) {
        showError(error);
    } finally {
        stopLoading();
    }
}

// Update weather data in the UI
function updateWeatherData(data) {
    const { main, sys, name, weather } = data;
    currentCity = name;

    // Display city name in the format "City, Country"
    locationEl.textContent = `${name}, ${sys.country}`;
    temperatureEl.textContent = `${Math.round(main.temp)}°C`;
    sunriseTimeEl.textContent = formatTime(sys.sunrise);
    sunsetTimeEl.textContent = formatTime(sys.sunset);
    humidityEl.textContent = `${main.humidity}%`;

    updateWeatherBackground(weather[0].main.toLowerCase());
}

// Update background based on weather condition
function updateWeatherBackground(condition) {
    const backgrounds = {
        'clear': 'IMAGES/clear-sky.jpg',
        'clouds': 'IMAGES/cloudy.jpg',
        'rain': 'IMAGES/rain.avif',
        'thunderstorm': 'IMAGES/thunderstorm.jpg',
        'snow': 'IMAGES/snow.png',
        'mist': 'IMAGES/mist.jpg',
        'fog': 'IMAGES/mist.jpg',
        'drizzle': 'IMAGES/drizzle.avif',
        'haze': 'IMAGES/haze.jpg',
        'dust': 'IMAGES/dust.webp',
        'sand': 'IMAGES/sandstorm.avif',
        'ash': 'IMAGES/ash.jpg',
        'tornado': 'IMAGES/tornado.webp'
    };

    weatherContainer.style.backgroundImage = `url('${backgrounds[condition] || 'IMAGES/cloudy.jpg'}')`;
}

// Display 5-day forecast
function displayForecast(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    forecastTable.innerHTML = dailyData.map(item => `
        <tr>
            <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
            <td>${Math.round(item.main.temp)}°C</td>
            <td>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" 
                     alt="${item.weather[0].description}" 
                     class="forecast-icon">
                <span class="forecast-condition">${item.weather[0].description}</span>
            </td>
        </tr>
    `).join('');
}

// Handle search button click
function handleSearch() {
    const city = searchBar.value.trim();
    if (city) fetchWeatherByCity(city);
}

// Handle reload button click
function handleReload() {
    if (currentCity) {
        reloadButton.classList.add('spin');
        fetchWeatherByCity(currentCity)
            .finally(() => reloadButton.classList.remove('spin'));
    }
}

// Handle auto-suggest as user types
function handleAutoSuggest() {
    const query = searchBar.value.trim();
    if (!query) {
        autoSuggestBox.classList.remove("visible");
        return;
    }

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`)
        .then(response => response.json())
        .then(cities => {
            if (cities.length > 0) {
                autoSuggestBox.innerHTML = cities.map(city => `
                    <div class="suggest-item" 
                         onclick="selectCity('${city.name}, ${city.country}')">
                        ${city.name}, ${city.country}
                    </div>
                `).join('');
                autoSuggestBox.classList.add("visible");
            } else {
                autoSuggestBox.innerHTML = `<div class="suggest-error">No results found</div>`;
                autoSuggestBox.classList.add("visible");
            }
        })
        .catch(() => {
            autoSuggestBox.innerHTML = `<div class="suggest-error">Error fetching suggestions</div>`;
            autoSuggestBox.classList.add("visible");
        });
}

// Select a city from suggestions
function selectCity(cityName) {
    searchBar.value = cityName;
    autoSuggestBox.classList.remove("visible");
    fetchWeatherByCity(cityName.split(',')[0]); // Use only the city name for the API call
}

// Format time (sunrise/sunset)
function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Show loading state
function startLoading() {
    weatherContainer.classList.add('loading');
}

// Hide loading state
function stopLoading() {
    weatherContainer.classList.remove('loading');
}

// Show error message
function showError(error) {
    console.error('Error:', error);
    locationEl.textContent = error.message || "An error occurred";
    temperatureEl.textContent = "--°C";
    humidityEl.textContent = "--%";
    forecastTable.innerHTML = "<tr><td colspan='3'>Unable to load data</td></tr>";
}

// Handle data fetch errors
function handleDataError() {
    locationEl.textContent = "Data unavailable";
    temperatureEl.textContent = "--°C";
    humidityEl.textContent = "--%";
    forecastTable.innerHTML = "<tr><td colspan='3'>Unable to load forecast</td></tr>";
}