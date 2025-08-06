// File: api/getWeather.js
export default async function handler(request, response) {
  const apiKey = process.env.WEATHER_API_KEY;
  const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
  
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('units');

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured on server' });
  }

  let weatherURL, forecastURL;

  // Check if coordinates are provided, otherwise use city
  if (lat && lon) {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
  } else if (city) {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;
  } else {
    return response.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherURL),
      fetch(forecastURL)
    ]);

    if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(errorData.message || 'Failed to fetch forecast data');
    }

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    response.status(200).json({ weather: weatherData, forecast: forecastData });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
