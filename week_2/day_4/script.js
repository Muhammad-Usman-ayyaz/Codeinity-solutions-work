const API_KEY = "de44a1116fc3162a15d7cdc461eda266";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const DEFAULT_CITY = "London";
const STORAGE_KEY = "atmosphere_recent_searches";

let weatherState = {
    current: null,
    forecast: null,
    unit: 'metric'
};

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const unitC = document.getElementById('unitC');
const unitF = document.getElementById('unitF');
const recentSearchesBox = document.getElementById('recentSearchesBox');
const recentTags = document.getElementById('recentTags');
const errorMsg = document.getElementById('errorMsg');
const errorText = document.getElementById('errorText');
const loadingMsg = document.getElementById('loadingMsg');
const weatherContent = document.getElementById('weatherContent');

const locationName = document.getElementById('locationName');
const weatherDate = document.getElementById('weatherDate');
const weatherEmoji = document.getElementById('weatherEmoji');
const tempValue = document.getElementById('tempValue');
const tempUnitSymbol = document.getElementById('tempUnitSymbol');
const weatherCondition = document.getElementById('weatherCondition');
const tempHighLow = document.getElementById('tempHighLow');

const feelsLikeVal = document.getElementById('feelsLikeVal');
const humidityVal = document.getElementById('humidityVal');
const windSpeedVal = document.getElementById('windSpeedVal');
const pressureVal = document.getElementById('pressureVal');

const forecastList = document.getElementById('forecastList');

window.addEventListener('DOMContentLoaded', () => {
    searchBtn.addEventListener('click', () => searchCity());
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCity();
    });
    geoBtn.addEventListener('click', getUserLocation);
    
    unitC.addEventListener('click', () => {
        if (weatherState.unit === 'metric') return;
        weatherState.unit = 'metric';
        updateUnitButtons();
        renderWeather();
    });

    unitF.addEventListener('click', () => {
        if (weatherState.unit === 'imperial') return;
        weatherState.unit = 'imperial';
        updateUnitButtons();
        renderWeather();
    });

    renderRecentSearches();
    getUserLocation();
});

function updateUnitButtons() {
    if (weatherState.unit === 'metric') {
        unitC.className = "px-8 py-4 rounded-full text-xl md:text-2xl lg:text-3xl font-bold transition-all bg-white/25 text-white";
        unitF.className = "px-8 py-4 rounded-full text-xl md:text-2xl lg:text-3xl font-bold transition-all text-white/60 hover:text-white";
    } else {
        unitF.className = "px-8 py-4 rounded-full text-xl md:text-2xl lg:text-3xl font-bold transition-all bg-white/25 text-white";
        unitC.className = "px-8 py-4 rounded-full text-xl md:text-2xl lg:text-3xl font-bold transition-all text-white/60 hover:text-white";
    }
}

function getUserLocation() {
    setLoading(true);
    hideError();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherData('coords', { lat: position.coords.latitude, lon: position.coords.longitude });
            },
            () => {
                fetchWeatherData('name', DEFAULT_CITY);
            }
        );
    } else {
        fetchWeatherData('name', DEFAULT_CITY);
    }
}

function searchCity() {
    const query = cityInput.value.trim();
    if (!query) return;
    
    setLoading(true);
    hideError();
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
        renderWeather();
        setLoading(false);
        cityInput.value = "";
    })
    .catch((error) => {
        showError(error.message === "City not found" 
            ? "City not found. Please double-check spelling." 
            : "Could not retrieve weather. Please try again.");
        setLoading(false);
    });
}

function renderWeather() {
    const current = weatherState.current;
    const forecast = weatherState.forecast;

    if (!current || !forecast) return;

    const timezoneOffset = current.timezone;

    updateBackgroundTheme(current.weather[0].id, current.weather[0].icon);

    weatherEmoji.textContent = getWeatherEmoji(current.weather[0].icon, current.weather[0].id);
    locationName.textContent = `${current.name}, ${current.sys.country}`;
    weatherDate.textContent = getCityDateTime(timezoneOffset);

    tempValue.textContent = formatTemp(current.main.temp);
    tempUnitSymbol.textContent = "°";
    weatherCondition.textContent = current.weather[0].description;
    
    const highTemp = formatTemp(current.main.temp_max);
    const lowTemp = formatTemp(current.main.temp_min);
    tempHighLow.textContent = `H: ${highTemp}°  •  L: ${lowTemp}°`;

    const speedUnit = weatherState.unit === 'imperial' ? 'mph' : 'km/h';
    const windSpeed = formatWindSpeed(current.wind.speed);
    feelsLikeVal.textContent = `${formatTemp(current.main.feels_like)}°${weatherState.unit === 'imperial' ? 'F' : 'C'}`;
    humidityVal.textContent = `${current.main.humidity}%`;
    windSpeedVal.textContent = `${windSpeed} ${speedUnit}`;
    pressureVal.textContent = `${current.main.pressure} hPa`;

    renderForecast(forecast.list, timezoneOffset);
}

function renderForecast(forecastListArray, timezoneOffset) {
    forecastList.innerHTML = "";

    const dailyData = {};
    forecastListArray.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

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

        const noonForecast = dayForecasts.find(f => f.dt_txt.includes("12:00:00")) || dayForecasts[Math.floor(dayForecasts.length / 2)];
        const weatherId = noonForecast.weather[0].id;
        const iconCode = noonForecast.weather[0].icon;
        const description = noonForecast.weather[0].description;
        const emoji = getWeatherEmoji(iconCode, weatherId);

        const dayDate = new Date(date + "T00:00:00");
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = daysOfWeek[dayDate.getDay()];

        const itemNode = document.createElement('div');
        itemNode.className = 'grid grid-cols-[160px_100px_1fr_auto] items-center py-8 md:py-12 border-b border-white/10 text-2xl md:text-4xl lg:text-5xl hover:pl-6 transition-all gap-6';
        itemNode.innerHTML = `
            <span class="font-semibold">${dayName}</span>
            <span class="text-5xl md:text-7xl">${emoji}</span>
            <span class="text-white/70 capitalize pl-6 whitespace-nowrap">${description}</span>
            <span class="text-right font-semibold ml-auto flex gap-6">
                <span class="forecast-max">${formatTemp(maxT)}°</span>
                <span class="forecast-min text-white/50">${formatTemp(minT)}°</span>
            </span>
        `;
        forecastList.appendChild(itemNode);
    });
}

function formatTemp(val) {
    if (weatherState.unit === 'imperial') {
        return Math.round((val * 9/5) + 32);
    }
    return Math.round(val);
}

function formatWindSpeed(mps) {
    if (weatherState.unit === 'imperial') {
        return Math.round(mps * 2.237);
    }
    return Math.round(mps * 3.6);
}

function updateBackgroundTheme(weatherId, iconCode) {
    document.body.classList.remove(
        'from-cyan-500', 'to-blue-600',
        'from-slate-900', 'via-slate-800', 'to-zinc-950',
        'from-slate-500', 'to-slate-700',
        'from-blue-700', 'to-slate-900',
        'from-slate-400', 'to-indigo-900',
        'from-purple-950', 'via-slate-900', 'to-black',
        'from-zinc-500', 'to-slate-600'
    );

    if (weatherId === 800) {
        if (iconCode.includes('d')) {
            document.body.classList.add('from-cyan-500', 'to-blue-600');
        } else {
            document.body.classList.add('from-slate-900', 'via-slate-800', 'to-zinc-950');
        }
    } else if (weatherId >= 801 && weatherId <= 804) {
        document.body.classList.add('from-slate-500', 'to-slate-700');
    } else if (weatherId >= 200 && weatherId < 300) {
        document.body.classList.add('from-purple-950', 'via-slate-900', 'to-black');
    } else if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
        document.body.classList.add('from-blue-700', 'to-slate-900');
    } else if (weatherId >= 600 && weatherId < 700) {
        document.body.classList.add('from-slate-400', 'to-indigo-900');
    } else if (weatherId >= 700 && weatherId < 800) {
        document.body.classList.add('from-zinc-500', 'to-slate-600');
    } else {
        document.body.classList.add('from-cyan-500', 'to-blue-600');
    }
}

function getWeatherEmoji(iconCode, id) {
    if (id === 800) {
        return iconCode.includes('d') ? '☀️' : '🌙';
    }
    if (id === 801 || id === 802) {
        return iconCode.includes('d') ? '⛅' : '☁️';
    }
    if (id === 803 || id === 804) {
        return '☁️';
    }
    if (id >= 200 && id < 300) {
        return '⛈️';
    }
    if (id >= 300 && id < 400) {
        return '🌦️';
    }
    if (id >= 500 && id < 600) {
        return '🌧️';
    }
    if (id >= 600 && id < 700) {
        return '❄️';
    }
    if (id >= 700 && id < 800) {
        return '🌫️';
    }
    return '🌡️';
}

function getCityDateTime(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (timezoneOffset * 1000));
    
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    return cityTime.toLocaleDateString('en-US', options);
}

function saveRecentSearch(cityName) {
    let searches = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    searches = searches.filter(item => item.toLowerCase() !== cityName.toLowerCase());
    
    searches.unshift(cityName);
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
        tag.className = 'text-white/90 hover:text-white cursor-pointer underline underline-offset-[12px] hover:opacity-100 transition-all font-semibold';
        tag.textContent = city;
        tag.addEventListener('click', () => {
            setLoading(true);
            hideError();
            fetchWeatherData('name', city);
        });
        recentTags.appendChild(tag);
        
        if (idx < searches.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ", ";
            separator.className = "text-white/40 select-none";
            recentTags.appendChild(separator);
        }
    });
}

function setLoading(isLoading) {
    if (isLoading) {
        loadingMsg.classList.remove('hidden');
        weatherContent.classList.add('hidden');
        errorMsg.classList.add('hidden');
    } else {
        loadingMsg.classList.add('hidden');
        weatherContent.classList.remove('hidden');
    }
}

function showError(message) {
    errorText.textContent = message;
    errorMsg.classList.remove('hidden');
    weatherContent.classList.add('hidden');
    loadingMsg.classList.add('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}
