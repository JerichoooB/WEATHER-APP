import {weatherApiCode} from '../utils/weatherApiCodes';
export async function searchCities(query, signal) {
 const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name:query,count:8,language:'en',format:'json'})}`,{signal});
 if (!response.ok) throw new Error('City search is temporarily unavailable. Please try again.');
 return (await response.json()).results || [];
}
async function fetchForecast(city, signal) {
 const params = new URLSearchParams({latitude:city.latitude,longitude:city.longitude,timezone:'auto',forecast_days:7,current:'temperature_2m',hourly:'temperature_2m,weather_code,precipitation_probability,dew_point_2m,is_day',daily:'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset'});
 const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{signal});
 if (!response.ok) throw new Error('We couldn’t retrieve the weather. Please check your connection and try again.');
 const data = await response.json();
 if (!data.current || !data.hourly?.time?.length || !data.daily?.time?.length) throw new Error('The weather provider returned incomplete data. Please try again.');
 return data;
}

async function fetchCurrent(city, signal) {
 const response=await fetch(`/api/current-weather?${new URLSearchParams({latitude:city.latitude,longitude:city.longitude})}`,{signal});
 const body=await response.json();
 if(!response.ok)throw new Error(body.error || 'Current conditions are unavailable from WeatherAPI.');
 const c=body.current;
 if(!c||!Number.isFinite(c.temp_c)||!Number.isFinite(c.last_updated_epoch))throw new Error('WeatherAPI returned incomplete current conditions.');
 return {temperature_2m:c.temp_c,apparent_temperature:c.feelslike_c,relative_humidity_2m:c.humidity,wind_speed_10m:c.wind_kph,wind_direction_10m:c.wind_degree,surface_pressure:c.pressure_mb,cloud_cover:c.cloud,is_day:c.is_day,weather_code:weatherApiCode(c.condition?.code),condition_text:c.condition?.text,visibility:c.vis_km==null?null:c.vis_km*1000,uv_index:c.uv,observed_at:c.last_updated_epoch*1000};
}
export async function fetchWeather(city, signal) {
 const [forecast,result]=await Promise.all([fetchForecast(city,signal),fetchCurrent(city,signal).then(current=>({current})).catch(error=>{if(error.name==='AbortError')throw error;return {current:null,error:error.message};})]);
 return {...forecast,forecast_time:forecast.current.time,current:result.current?{...result.current,time:forecast.current.time}:null,current_error:result.error || null,current_source:'WeatherAPI'};
}
