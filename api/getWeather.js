// This code runs on a server, not in the browser!
export default async function handler(request, response) {
  // Get the API key securely from environment variables
  const apiKey = process.env.WEATHER_API_KEY;

  // Get the city and units from the client's request URL
  const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
  const city = searchParams.get('city');
  const units = searchParams.get('units');

  if (!city) {
    return response.status(400).json({ error: 'City is required' });
  }

  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

  try {
    // Fetch both weather and forecast data from the OpenWeatherMap API
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(weatherURL),
      fetch(forecastURL)
    ]);

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    // Send the combined data back to your front-end
    response.status(200).json({ weather: weatherData, forecast: forecastData });

  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
