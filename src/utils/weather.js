import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudLightning, Snowflake } from 'lucide-react';
export function condition(code, day = true) {
 if (code == null) return { label: 'Unavailable', Icon: Cloud, scene: 'cloudy' };
 if (code === 0) return { label: 'Clear skies', Icon: day ? Sun : Moon, scene: day ? 'sunny' : 'night' };
 if (code <= 2) return { label: 'Partly cloudy', Icon: day ? CloudSun : CloudMoon, scene: day ? 'cloudy' : 'night' };
 if (code === 3) return { label: 'Overcast', Icon: Cloud, scene: 'cloudy' };
 if (code <= 48) return { label: 'Foggy', Icon: CloudFog, scene: 'cloudy' };
 if (code >= 95) return { label: 'Thunderstorms', Icon: CloudLightning, scene: 'stormy' };
 if ([71,73,75,77,85,86].includes(code)) return { label: 'Snow', Icon: Snowflake, scene: 'snow' };
 if (code <= 57) return { label: 'Drizzle', Icon: CloudDrizzle, scene: 'rainy' };
 return { label: 'Rain showers', Icon: CloudRain, scene: 'rainy' };
}
export const temperature = (v, unit) => v == null ? '—' : Math.round(unit === 'F' ? v * 9 / 5 + 32 : v) + '°';
export const value = (v, suffix = '') => v == null ? '—' : Math.round(v) + suffix;
export const direction = deg => deg == null ? '—' : ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
export const hourLabel = t => t ? new Date(t + 'Z').toLocaleTimeString('en-US',{hour:'numeric',timeZone:'UTC'}) : '—';
export const dayLabel = t => new Date(t+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'short',timeZone:'UTC'});
export const dateLabel = t => new Date(t+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
export function localParts(timezone = 'Asia/Manila', now = new Date()) {
 const hour = Number(new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:timezone}).format(now));
 return {greeting: hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening', date: new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:timezone}).format(now), clock: new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:timezone}).format(now)};
}
export const defaultCity = {id:1713226,name:'Baguio City',admin1:'Benguet',country:'Philippines',latitude:16.4164,longitude:120.5931};
export const cityKey = c => `${c.latitude},${c.longitude}`;

export const timeLabel = t => t ? new Date(t + 'Z').toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}) : '—';
