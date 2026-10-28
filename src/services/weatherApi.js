export async function searchCities(query, signal) {
 const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name:query,count:8,language:'en',format:'json'})}`,{signal});
 if (!response.ok) throw new Error('City search is temporarily unavailable. Please try again.');
 return (await response.json()).results || [];
}
export async function fetchWeather(city, signal) {
 const params = new URLSearchParams({latitude:city.latitude,longitude:city.longitude,timezone:'auto',forecast_days:7,current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m',hourly:'temperature_2m,relative_humidity_2m,weather_code,precipitation_probability,visibility,dew_point_2m,is_day',daily:'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max'});
 const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{signal});
 if (!response.ok) throw new Error('We couldn’t retrieve the weather. Please check your connection and try again.');
 const data = await response.json();
 if (!data.current || !data.hourly?.time?.length || !data.daily?.time?.length) throw new Error('The weather provider returned incomplete data. Please try again.');
 return data;
}
