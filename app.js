function WeatherApp(apiKey) {

  this.apiKey = "c6dd9f9988aafcc7c906d863491739ac";
  this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
  this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

  // DOM
  this.searchBtn = document.getElementById("search-btn");
  this.cityInput = document.getElementById("city-input");
  this.weatherDisplay = document.getElementById("weather-display");
  this.forecastDisplay = document.getElementById("forecast-display");

  this.recentSection = document.getElementById("recent-searches-section");
  this.recentContainer = document.getElementById("recent-searches-container");

  this.recentSearches = [];
  this.maxRecentSearches = 5;

  this.init();
}

/* ================= INIT ================= */
WeatherApp.prototype.init = function () {

  this.searchBtn.addEventListener(
    "click",
    this.handleSearch.bind(this)
  );

  this.cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") this.handleSearch();
  });

  document
    .getElementById("clear-history-btn")
    .addEventListener("click", this.clearHistory.bind(this));

  this.loadRecentSearches();
  this.loadLastCity();
};

/* ================= SEARCH ================= */
WeatherApp.prototype.handleSearch = function () {
  const city = this.cityInput.value.trim();
  if (!city) return;
  this.getWeather(city);
};

/* ================= API CALL ================= */
WeatherApp.prototype.getWeather = async function (city) {

  this.showLoading();

  try {
    const currentUrl =
      `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    const [current, forecast] = await Promise.all([
      axios.get(currentUrl),
      this.getForecast(city)
    ]);

    this.displayWeather(current.data);
    this.displayForecast(forecast);

    this.saveRecentSearch(city);
    localStorage.setItem("lastCity", city);

  } catch (err) {
    this.showError("City not found");
  }
};

/* ================= FORECAST ================= */
WeatherApp.prototype.getForecast = async function (city) {
  const url =
    `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

  const res = await axios.get(url);

  return res.data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );
};

/* ================= DISPLAY ================= */
WeatherApp.prototype.displayWeather = function (data) {

  const html = `
    <div class="weather-card">
      <h2>${data.name}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
      <h3>${data.main.temp}°C</h3>
      <p>${data.weather[0].description}</p>
    </div>
  `;

  this.weatherDisplay.innerHTML = html;
};

WeatherApp.prototype.displayForecast = function (forecast) {

  this.forecastDisplay.innerHTML = "";

  forecast.forEach(day => {
    const card = `
      <div class="forecast-card">
        <p>${day.dt_txt.split(" ")[0]}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <p>${day.main.temp}°C</p>
      </div>
    `;
    this.forecastDisplay.innerHTML += card;
  });
};

/* ================= STORAGE ================= */

WeatherApp.prototype.loadRecentSearches = function () {
  const saved = localStorage.getItem("recentSearches");
  if (saved) this.recentSearches = JSON.parse(saved);
  this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {

  city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  const index = this.recentSearches.indexOf(city);
  if (index > -1) this.recentSearches.splice(index, 1);

  this.recentSearches.unshift(city);

  if (this.recentSearches.length > this.maxRecentSearches)
    this.recentSearches.pop();

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(this.recentSearches)
  );

  this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {

  this.recentContainer.innerHTML = "";

  if (!this.recentSearches.length) {
    this.recentSection.style.display = "none";
    return;
  }

  this.recentSection.style.display = "block";

  this.recentSearches.forEach(city => {

    const btn = document.createElement("button");
    btn.className = "recent-search-btn";
    btn.textContent = city;

    btn.addEventListener("click", () => {
      this.getWeather(city);
    });

    this.recentContainer.appendChild(btn);
  });
};

WeatherApp.prototype.loadLastCity = function () {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) this.getWeather(lastCity);
};

WeatherApp.prototype.clearHistory = function () {
  if (confirm("Clear search history?")) {
    localStorage.removeItem("recentSearches");
    this.recentSearches = [];
    this.displayRecentSearches();
  }
};

/* ================= UI STATES ================= */

WeatherApp.prototype.showLoading = function () {
  this.weatherDisplay.innerHTML =
    `<div class="spinner"></div>`;
};

WeatherApp.prototype.showError = function (msg) {
  this.weatherDisplay.innerHTML =
    `<p class="error">${msg}</p>`;
};

/* ================= START APP ================= */

const app = new WeatherApp("YOUR_API_KEY_HERE");