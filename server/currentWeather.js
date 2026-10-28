const cache = new Map();
const MAX_ENTRIES = 100;
const TTL = 5 * 60 * 1000;
export async function currentWeather(req, res) {
 res.setHeader('Content-Type', 'application/json');
 res.setHeader('Cache-Control', 'no-store');
 const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
 if (req.method !== 'GET') {res.setHeader('Allow','GET');return send(405,{error:'Method not allowed.'});}
 const url=new URL(req.url,'http://localhost');
 const lat=url.searchParams.get('latitude'),lon=url.searchParams.get('longitude');
 if (lat===null||lon===null||lat.trim()===''||lon.trim()===''||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lon))||Math.abs(Number(lat))>90||Math.abs(Number(lon))>180) return send(400,{error:'A valid latitude and longitude are required.'});
 const key=process.env.WEATHERAPI_KEY;
 if(!key)return send(503,{error:'WeatherAPI is not connected yet. Add WEATHERAPI_KEY in the server environment settings.'});
 const location=`${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`;
 const cached=cache.get(location);
 if(cached&&Date.now()-cached.time<TTL)return send(200,cached.data);
 try {
  const response=await fetch(`https://api.weatherapi.com/v1/current.json?${new URLSearchParams({key,q:location,aqi:'no'})}`,{signal:AbortSignal.timeout(12000)});
  if(!response.ok) {
   if(response.status===401||response.status===403)return send(502,{error:'WeatherAPI rejected the server API key or account access. Check its configuration.'});
   if(response.status===429)return send(503,{error:'WeatherAPI request limit reached. Please try again later.'});
   return send(502,{error:'Current conditions are temporarily unavailable from WeatherAPI.'});
  }
  const data=await response.json();
  const c=data.current;
  if(!c||!Number.isFinite(c.temp_c)||!Number.isFinite(c.last_updated_epoch)||!c.condition)return send(502,{error:'WeatherAPI returned incomplete current conditions.'});
  // Only forward fields used by SkyCast. Never forward credentials or request URLs.
  const body={current:{last_updated_epoch:c.last_updated_epoch,temp_c:c.temp_c,feelslike_c:c.feelslike_c,humidity:c.humidity,wind_kph:c.wind_kph,wind_degree:c.wind_degree,pressure_mb:c.pressure_mb,cloud:c.cloud,is_day:c.is_day,vis_km:c.vis_km,uv:c.uv,condition:{code:c.condition.code,text:c.condition.text}}};
  if(cache.size>=MAX_ENTRIES)cache.delete(cache.keys().next().value);
  cache.set(location,{time:Date.now(),data:body});return send(200,body);
 } catch {return send(502,{error:'Could not reach WeatherAPI. Please check the server connection and try again.'});}
}
