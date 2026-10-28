# SkyCast

A responsive React weather dashboard. **Current conditions: WeatherAPI. Hourly and seven-day forecasts: Open-Meteo.** City search uses Open-Meteo Geocoding; maps use Leaflet and OpenStreetMap.

## Setup

Use Node.js 22.12+ (tested with Node 24) and npm. Supply `WEATHERAPI_KEY` securely in the **server runtime environment**. Get a key from [WeatherAPI](https://www.weatherapi.com/). Current conditions use `/v1/current.json`; no paid WeatherAPI forecast plan is required by this integration. Provider account limits and terms apply.

Never commit the key or name it with a `VITE_` prefix: Vite-prefixed values are embedded in the public browser bundle. `.env.example` lists the required variable without a value. For local development, export the variable in your shell or use your secret manager before starting the process; merely creating a `.env` file does not inject it into this server.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

Outside this cloud environment, omit the cache option or choose a writable directory.

## Production

```sh
npm run build
npm start
```

The production Node server serves `dist` and `/api/current-weather` on `PORT` (default 3000). `npm run preview` also starts this server. A static-file-only host cannot serve the protected WeatherAPI endpoint. Vercel can use `api/current-weather.js` as a Node function alongside the Vite build; configure `WEATHERAPI_KEY` in the project's server environment and rebuild/redeploy as appropriate. Other hosts must run `server/index.js` or provide an equivalent server endpoint.

## Data accuracy and freshness

WeatherAPI supplies provider-reported current temperature, feels-like temperature, humidity, wind, pressure, sky condition, visibility, and UV. Open-Meteo supplies hourly forecasts, seven-day highs/lows, precipitation probabilities, hourly dew point, and sunrise/sunset. Current-condition timestamps shown on the dashboard come from WeatherAPI's `last_updated_epoch` in the selected city's time zone. A manual refresh retrieves the latest available response; it cannot force the provider to generate a new observation. Data revalidates every ten minutes while visible and when a stale tab regains focus. The server caches current conditions for five minutes per coordinate pair, with a bounded in-memory cache.

Changing providers does not guarantee better accuracy at every location. Current conditions can be based on stations and provider processing, and mountainous locations such as Baguio can vary sharply with elevation. Forecasts remain model estimates. Missing values display a dash. If WeatherAPI is not configured or fails, the UI explains the failure, keeps available forecasts, and does **not** silently substitute model-based current readings.

Temperatures can be Celsius or Fahrenheit; wind remains km/h, pressure hPa (WeatherAPI-reported pressure), and visibility km. Forecast requests use `timezone=auto`. Dew point and precipitation probability refer to the current forecast hour. Geolocation runs only after the user clicks its button; location permission requires HTTPS or localhost. Favorites, selected city, unit, and theme stay in localStorage.

## External services and security

Runtime network destinations:

- `api.weatherapi.com` — server-only current conditions, HTTPS
- `api.open-meteo.com` — browser forecasts
- `geocoding-api.open-meteo.com` — browser city search
- `tile.openstreetmap.org` — geographic map tiles, with attribution; no radar overlay
- `fonts.googleapis.com` and `fonts.gstatic.com` — Inter, with system fallback
- `registry.npmjs.org` — dependency installation

The current-weather endpoint validates coordinates, accepts GET only, applies an upstream timeout, strips unused fields, and does not expose the key or upstream request URLs in responses. Public deployments should additionally configure hosting-level rate limits to protect their API quota. Keep all credentials server-side.

Background photographs are local in `public/images`, selected by condition and daylight. Unsplash source IDs: sunny `1464822759023-fed622ff2c3b`, cloudy `1470770841072-f978cf4d019e`, rainy `1515694346937-94d85e41e6f0`, stormy `1504253163759-c23fccaebb55`, night `1519681393784-d120267933ba`, snow `1483664852095-d6cc6870702d`. Prefix each with `https://images.unsplash.com/photo-` to view the source. [Unsplash license](https://unsplash.com/license). These are landscape illustrations, not live views of the city.

## Tests

```sh
npm test
npm run build
# With a configured key and the dev server running:
node scripts/live-smoke.mjs
```

Node tests exercise the server's validation, missing-key handling, response filtering, caching, and upstream failures. Playwright tests cover dashboard behavior, city switching, favorites, units, themes, navigation, mobile overflow, and missing WeatherAPI configuration using controlled provider-shaped responses. No fixture values are used in the application.

Browser tests use `/usr/bin/chromium`; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another installed executable. In the cloud environment, native Chromium requests can reject the proxy certificate. The live smoke script forwards real HTTPS responses through Playwright's Node transport using the platform's trusted CA configuration, preserving TLS verification. This is a test transport, not an application fallback.

The WeatherAPI migration passes the build and controlled tests. Live WeatherAPI validation remains pending a configured `WEATHERAPI_KEY`; no key was available when the integration was implemented. Earlier live checks validated Open-Meteo, geocoding, map tiles, and local images. The requested Design #1 reference was not attached, so the design follows the supplied written specification.

## Architecture

- `server/currentWeather.js`: protected WeatherAPI proxy, shared by Vite, Node production, and Vercel
- `server/index.js`: standalone production HTTP server
- `src/services/weatherApi.js`: client data composition and provider normalization
- `src/hooks/useWeather.js`: requests, cancellation, periodic revalidation, and saved preferences
- `src/utils`: weather codes, icons, and formatting
- `src/components`: city search, chart, weather icon, and interactive map
- `src/App.jsx`: dashboard and navigation views
