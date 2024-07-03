const params = {
    "latitude": '',
    "longitude": '',
    "current": ["temperature_2m","relative_humidity_2m","is_day","precipitation","showers","weather_code","wind_speed_10m"],
    "hourly": "precipitation_probability",
    'forecast_days': 1,
};

const selectedCity = {
    name: '',
    country: '',
}

const geocodeUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const apiUrl = 'https://api.open-meteo.com/v1/forecast';

const form = document.getElementById('city-form');
const locationButton = document.getElementById('location');
const errorDiv = document.getElementById('error-message');

/* 

WMO Weather interpretation codes (WW)
Code	        Description

0	            Clear sky
1, 2, 3	        Mainly clear, partly cloudy, and overcast
45, 48	        Fog and depositing rime fog
51, 53, 55	    Drizzle: Light, moderate, and dense intensity
56, 57	        Freezing Drizzle: Light and dense intensity
61, 63, 65	    Rain: Slight, moderate and heavy intensity
66, 67	        Freezing Rain: Light and heavy intensity
71, 73, 75	    Snow fall: Slight, moderate, and heavy intensity
77	            Snow grains
80, 81, 82	    Rain showers: Slight, moderate, and violent
85, 86	        Snow showers slight and heavy
95 *	        Thunderstorm: Slight or moderate
96, 99 *	    Thunderstorm with slight and heavy hail

(*)             Thunderstorm forecast with hail is only available in Central Europe

*/

const weatherInterpretationCodes = {
    0: 'clear',
    1: 'clear',
    2: 'cloud',
    3: 'overcast',
    45: 'fog',
    48: 'fog',
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    56: 'drizzle',
    57: 'drizzle',
    61: 'rainy',
    63: 'rainy',
    65: 'rainy',
    66: 'rainy',
    67: 'rainy',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    77: 'snow',
    80: 'rainy',
    81: 'rainy',
    82: 'rainy',
    85: 'sleet',
    86: 'sleet',
    95: 'thunderstorm',
    96: 'thunderstorm',
    99: 'thunderstorm',
}

function displayWeather(data, name, country) {

    let currentHour = new Date().getHours();

    try {

        const city = name;
        const currentTemp = data.current.temperature_2m;
        const precipitation = data.hourly.precipitation_probability[currentHour];
        const humidity = data.current.relative_humidity_2m;
        const isDay = data.current.is_day;
        const windSpeed = data.current.wind_speed_10m;
        const weatherCode = data.current.weather_code;

        document.getElementById('city-name').textContent = `${city}, ${country}`;
        document.getElementById('temp-value').textContent = `${Math.round(currentTemp)}°C`;
        document.getElementById('precipitation-value').textContent = `${precipitation}%`;
        document.getElementById('humidity-value').textContent = `${humidity}%`;
        document.getElementById('wind-value').textContent = `${windSpeed} m/s`;

        weatherInterpretation(isDay, weatherCode);

    } catch (error) {
        console.error('Error displaying weather data:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.classList.remove('hidden');
    }
    
} 

function weatherInterpretation(isDay, weatherCode) {

    if (isDay === 1) {
        document.getElementById('icon').src = `../svg/${weatherInterpretationCodes[weatherCode]}-day.svg`;
    } else {
        document.getElementById('icon').src = `../svg/${weatherInterpretationCodes[weatherCode]}-night.svg`;
    }

}

async function getWeatherData() {
    
    try {
        const weatherResponse = await fetch(`${apiUrl}?${new URLSearchParams(params)}`, {method: 'GET'});
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.classList.remove('hidden');
    }
}

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const cityName = document.getElementById('cityInput').value;

    try {

        if ((params.latitude === undefined) || (params.longitude === undefined)) {
            const geoResponse = await fetch(`${geocodeUrl}?name=${cityName}`);
            if (!geoResponse.ok) {
                throw new Error('Failed to fetch geolocation data');
            }
            const geoData = await geoResponse.json();
            const { latitude, longitude, name, country } = geoData.results[0];

            params.latitude = latitude;
            params.longitude = longitude;
            selectedCity.name = name;
            selectedCity.country = country;
        }

        const weatherResponse = await fetch(`${apiUrl}?${new URLSearchParams(params)}`, { method: 'GET' });
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData, selectedCity.name, selectedCity.country);

        params.latitude = undefined;
        params.longitude = undefined;
        selectedCity.name = undefined;
        selectedCity.country = undefined;

    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.classList.remove('hidden');
    }

    form.reset();
});

async function placeholderWeather() {

    try {
        params.latitude = -34.61315;
        params.longitude = -58.37723;
        const weatherResponse = await fetch(`${apiUrl}?${new URLSearchParams(params)}`, {method: 'GET'});

        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        displayWeather(weatherData, 'Buenos Aires', 'Argentina');

    } catch (error) {
        console.error('Error fetching weather data:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.classList.remove('hidden');
    }

    placeholderWeather(); 
}