// File: api/getWeather.js
export default async function handler(request, response) {
  // Get the secret API key from Vercel's environment variables
  const apiKey = process.env.WEATHER_API_KEY;
  
  // Get parameters (city or coordinates) from the front-end's request
  const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('units');

  // Check if the API key is configured on the server
  if (!apiKey) {
    return response.status(500).json({ error: 'API Key not configured on server' });
  }

  let weatherURL, forecastURL;

  // Build the correct API URLs based on whether coordinates or a city name were provided
  if (lat && lon) {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
  } else if (city) {
    weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;
  } else {
    // If neither is provided, return an error
    return response.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    // Fetch both the current weather and the forecast data at the same time
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherURL),
      fetch(forecastURL)
    ]);

    // Check if both API calls were successful
    if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        throw new Error(errorData.message || 'Failed to fetch forecast data');
    }

    // Parse the JSON data from the responses
    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    // Send the combined data back to your front-end website
    response.status(200).json({ weather: weatherData, forecast: forecastData });
  } catch (error) {
    // If anything goes wrong, send back an error message
    response.status(500).json({ error: error.message });
  }
}
