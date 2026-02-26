const API_KEY = "c6dd9f9988aafcc7c906d863491739ac";

function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.init();
}


// INIT
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSearch();
    });

    this.showWelcome();
};


// WELCOME
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <h3>🌍 Welcome to SkyFetch</h3>
            <p>Search any city to view weather & forecast</p>
        </div>
    `;
};


// SEARCH
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) return this.showError("Enter a city name");
    if (city.length < 2) return this.showError("City name too short");

    this.getWeather(city);
    this.cityInput.value = "";
};


// GET WEATHER + FORECAST
WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const weatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastUrl = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {

        const [weatherRes, forecastRes] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(forecastUrl)
        ]);

        this.displayWeather(weatherRes.data);
        this.displayForecast(forecastRes.data);

    } catch (error) {

        if (error.response && error.response.status === 404)
            this.showError("City not found");
        else
            this.showError("Something went wrong");

    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "🔍 Search";
    }
};


// DISPLAY CURRENT WEATHER
WeatherApp.prototype.displayWeather = function (data) {

    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="${iconUrl}">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `;
};


// PROCESS FORECAST DATA
WeatherApp.prototype.processForecastData = function (data) {
    return data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);
};


// DISPLAY FORECAST
WeatherApp.prototype.displayForecast = function (data) {

    const daily = this.processForecastData(data);

    const cards = daily.map(day => {

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}">
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">${cards}</div>
        </div>
    `;
};


// LOADING
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather...</p>
        </div>
    `;
};


// ERROR
WeatherApp.prototype.showError = function (msg) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${msg}</p>
        </div>
    `;
};


// CREATE APP INSTANCE
const app = new WeatherApp(API_KEY);