const API_KEY = "de44a1116fc3162a15d7cdc461eda266";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const DEFAULT_CITY = "Lahore";
const STORAGE_KEY = "atmosphere_recent_searches";

let weatherState = {
    current: null,
    forecast: null,
    unit: 'metric' // metric = Celsius, imperial = Fahrenheit
};

// --- 1. Grab all HTML Elements ---
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchbtn');
const geoBtn = document.getElementById('geobtn');
const unitC = document.getElementById('unitC');
const unitF = document.getElementById('unitF');

const recentSearchesBox = document.getElementById('recentSearches');
const recentTags = document.getElementById('searches');

const errorMsg = document.getElementById('errormsg');
const errorText = document.getElementById('errortxt');
const loadingMsg = document.getElementById('loadingMsg');
const weatherContent = document.getElementById('weatherContent');

const locationName = document.getElementById('locationName');
const weatherDate = document.getElementById('weatherDate');
const weatherEmoji = document.getElementById('weatherEmoji');
const tempValue = document.getElementById('temperature');
const tempUnitSymbol = document.getElementById('tempunitsymbol');

// Details
const feelsLikeVal = document.querySelector('.feelslikeval');
const humidityVal = document.getElementById('humidityval');
const windSpeedVal = document.getElementById('windspeedval');
const pressureVal = document.getElementById('pressureval');
const sunriseVal = document.getElementById('sunrisetimeval'); // Your custom addition!
const sunsetVal = document.getElementById('sunsettimeval');   // Your custom addition!

const forecastList = document.getElementById('forecastlist');

// --- 2. Setup Event Listeners ---
window.addEventListener('DOMContentLoaded', () => {
    // Listen for clicks on the search button
    searchBtn.addEventListener('click', () => searchCity());

    // Listen for the "Enter" key in the search bar
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCity();
    });

    // Listen for the location button
    geoBtn.addEventListener('click', getUserLocation);

    // Unit toggles
    unitC.addEventListener('click', () => changeUnit('metric'));
    unitF.addEventListener('click', () => changeUnit('imperial'));

    // Automatically load location on startup
    getUserLocation();
});

// Placeholder functions (we will fill these in next!)
function searchCity() { }
function getUserLocation() { }
function changeUnit(newUnit) { }
// --- 3. Fetching Data ---

function getUserLocation() {
    setLoading(true);

    // Ask the browser for the user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherData('coords', { lat: position.coords.latitude, lon: position.coords.longitude });
            },
            () => {
                // If they deny location permission, fallback to the default city
                fetchWeatherData('name', DEFAULT_CITY);
            }
        );
    } else {
        fetchWeatherData('name', DEFAULT_CITY);
    }
}

function searchCity() {
    const query = cityInput.value.trim();
    if (!query) return; // Don't search if it's empty

    setLoading(true);
    fetchWeatherData('name', query);
}

function fetchWeatherData(type, value) {
    let currentUrl = "";
    let forecastUrl = "";

    if (type === 'name') {
        const query = encodeURIComponent(value);
        currentUrl = `${BASE_URL}weather?q=${query}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${BASE_URL}forecast?q=${query}&appid=${API_KEY}&units=metric`;
    } else if (type === 'coords') {
        currentUrl = `${BASE_URL}weather?lat=${value.lat}&lon=${value.lon}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${BASE_URL}forecast?lat=${value.lat}&lon=${value.lon}&appid=${API_KEY}&units=metric`;
    }

    // Fetch both Current Weather AND Forecast at the same time
    Promise.all([
        fetch(currentUrl).then(res => {
            if (!res.ok) throw new Error("City not found");
            return res.json();
        }),
        fetch(forecastUrl).then(res => {
            if (!res.ok) throw new Error("Forecast failed");
            return res.json();
        })
    ])
        .then(([currentData, forecastData]) => {
            weatherState.current = currentData;
            weatherState.forecast = forecastData;
            saveRecentSearch(currentData.name);
            // We will build this function next! It updates the HTML with the data.
            renderWeather();

            setLoading(false); // Hide the loading spinner
            cityInput.value = ""; // Clear the search bar
        })
        .catch((error) => {
            showError();
        });
}

// --- 4. UI States (Loading, Error, Units) ---

function setLoading(isLoading) {
    if (isLoading) {
        loadingMsg.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        errorMsg.classList.add('hidden');
    } else {
        loadingMsg.classList.add('hidden');
        weatherContent.classList.remove('hidden'); // This removes the hidden class and reveals your data!
    }
}

function showError() {
    errorMsg.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    loadingMsg.classList.add('hidden');
}

function changeUnit(newUnit) {
    if (weatherState.unit === newUnit) return;
    weatherState.unit = newUnit;

    // Toggle the bold active state on the C/F buttons
    if (newUnit === 'metric') {
        unitC.classList.add('active');
        unitF.classList.remove('active');
    } else {
        unitF.classList.add('active');
        unitC.classList.remove('active');
    }

    // If we already fetched data, re-render the screen to show the new temperatures
    if (weatherState.current) renderWeather();
}

// --- 5. Displaying the Data (Render) ---

function renderWeather() {
    const current = weatherState.current;

    if (!current) return;

    // 1. Get the local time offset for the city
    const timezoneOffset = current.timezone;

    // 2. Figure out which emoji to show based on the weather code
    weatherEmoji.textContent = getWeatherEmoji(current.weather[0].icon, current.weather[0].id);

    // 3. Update Location and Date
    locationName.textContent = `${current.name}, ${current.sys.country}`;
    weatherDate.textContent = getCityDateTime(timezoneOffset);

    // 4. Update the big temperature
    tempValue.textContent = formatTemp(current.main.temp);

    // 5. Update the Extra Details
    const speedUnit = weatherState.unit === 'imperial' ? 'mph' : 'km/h';
    const tempUnitStr = weatherState.unit === 'imperial' ? 'F' : 'C';

    feelsLikeVal.textContent = `${formatTemp(current.main.feels_like)}°${tempUnitStr}`;
    humidityVal.textContent = `${current.main.humidity}%`;
    windSpeedVal.textContent = `${formatWindSpeed(current.wind.speed)} ${speedUnit}`;
    pressureVal.textContent = `${current.main.pressure} hPa`;

    // 6. Format and update your custom Sunrise/Sunset!
    sunriseVal.textContent = formatTime(current.sys.sunrise, timezoneOffset);
    sunsetVal.textContent = formatTime(current.sys.sunset, timezoneOffset);

    // 7. Finally, render the 5-day forecast
    // (We will build the renderForecast function in the very last chunk!)
    renderForecast(weatherState.forecast.list, timezoneOffset);
}

// --- 6. Helper Functions (Math & Time) ---

function formatTemp(val) {
    if (weatherState.unit === 'imperial') {
        return Math.round((val * 9 / 5) + 32); // Convert to Fahrenheit
    }
    return Math.round(val); // Already in Celsius
}

function formatWindSpeed(mps) {
    if (weatherState.unit === 'imperial') {
        return Math.round(mps * 2.237); // Convert meters/sec to mph
    }
    return Math.round(mps * 3.6); // Convert meters/sec to km/h
}

function getCityDateTime(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (timezoneOffset * 1000));

    const options = { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return cityTime.toLocaleDateString('en-US', options);
}

function formatTime(unixTime, timezoneOffset) {
    // Converts the raw API time into a clean "6:00 AM" format based on the city's timezone
    const rawDate = new Date(unixTime * 1000);
    const cityTime = new Date(rawDate.getTime() + (rawDate.getTimezoneOffset() * 60000) + (timezoneOffset * 1000));
    return cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getWeatherEmoji(iconCode, id) {
    if (id === 800) return iconCode.includes('d') ? '☀️' : '🌙';
    if (id === 801 || id === 802) return iconCode.includes('d') ? '⛅' : '☁️';
    if (id === 803 || id === 804) return '☁️';
    if (id >= 200 && id < 300) return '⛈️';
    if (id >= 300 && id < 400) return '🌦️';
    if (id >= 500 && id < 600) return '🌧️';
    if (id >= 600 && id < 700) return '❄️';
    if (id >= 700 && id < 800) return '🌫️';
    return '🌡️';
}
// --- 7. 5-Day Forecast ---

function renderForecast(forecastListArray, timezoneOffset) {
    forecastList.innerHTML = "";

    // The API gives us data every 3 hours. We group it by day.
    const dailyData = {};
    forecastListArray.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    // Remove today's date so we only show the *upcoming* 5 days
    const cityNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (timezoneOffset * 1000));
    const cityTodayStr = cityNow.toISOString().split('T')[0];
    delete dailyData[cityTodayStr];

    const dates = Object.keys(dailyData).sort().slice(0, 5);

    dates.forEach(date => {
        const dayForecasts = dailyData[date];

        let minT = Infinity;
        let maxT = -Infinity;
        dayForecasts.forEach(f => {
            if (f.main.temp_min < minT) minT = f.main.temp_min;
            if (f.main.temp_max > maxT) maxT = f.main.temp_max;
        });

        // Grab the weather icon from the middle of the day (noon)
        const noonForecast = dayForecasts.find(f => f.dt_txt.includes("12:00:00")) || dayForecasts[Math.floor(dayForecasts.length / 2)];
        const emoji = getWeatherEmoji(noonForecast.weather[0].icon, noonForecast.weather[0].id);

        const dayDate = new Date(date + "T00:00:00");
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = daysOfWeek[dayDate.getDay()];

        // Create the HTML for this specific day
        const itemNode = document.createElement('div');
        itemNode.className = 'forecast-item'; // This connects to your CSS!
        itemNode.innerHTML = `
            <strong>${dayName}</strong>
            <span style="font-size: 2.5rem;">${emoji}</span>
            <span style="text-transform: capitalize; opacity: 0.8;">${noonForecast.weather[0].description}</span>
            <div>
                <strong>${formatTemp(maxT)}°</strong>
                <span class="forecast-min">${formatTemp(minT)}°</span>
            </div>
        `;
        forecastList.appendChild(itemNode);
    });
}

// --- 8. Recent Searches ---

function saveRecentSearch(cityName) {
    let searches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Remove it if it already exists so we don't have duplicates
    searches = searches.filter(item => item.toLowerCase() !== cityName.toLowerCase());

    // Add it to the front of the list
    searches.unshift(cityName);

    // Keep only the last 5 searches
    if (searches.length > 5) {
        searches.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    renderRecentSearches();
}

function renderRecentSearches() {
    const searches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (searches.length === 0) {
        recentSearchesBox.classList.add('hidden');
        return;
    }

    recentSearchesBox.classList.remove('hidden');
    recentTags.innerHTML = "";

    searches.forEach((city, idx) => {
        const tag = document.createElement('span');
        tag.textContent = city;
        tag.style.cursor = "pointer";
        tag.style.textDecoration = "underline";
        tag.style.textUnderlineOffset = "5px";
        tag.style.fontWeight = "bold";

        // When they click a recent search, search for it again!
        tag.addEventListener('click', () => {
            setLoading(true);
            fetchWeatherData('name', city);
        });

        recentTags.appendChild(tag);

        // Add a comma between cities
        if (idx < searches.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ", ";
            separator.style.marginRight = "10px";
            separator.style.opacity = "0.5";
            recentTags.appendChild(separator);
        }
    });
}
