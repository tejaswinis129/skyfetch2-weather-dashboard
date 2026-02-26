const API_KEY = "c6dd9f9988aafcc7c906d863491739ac";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDisplay = document.getElementById("weather-display");


// 🌤 Fetch Weather (Async/Await)
async function getWeather(city) {

    showLoading();

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {

        if (error.response && error.response.status === 404) {
            showError("City not found. Check spelling.");
        } else {
            showError("Something went wrong. Try again.");
        }

    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
    }
}


// 🌡 Display Weather
function displayWeather(data) {

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    cityInput.focus();
}


// ❌ Error UI
function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
}


// ⏳ Loading UI
function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Fetching weather data...</p>
        </div>
    `;
}


// 🔍 Button Click
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});


// ⌨ Enter Key Support
cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});