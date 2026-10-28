# SkyCast

A responsive weather dashboard built with React, Vite, Tailwind CSS v4, Lucide, Motion, Recharts, and Leaflet. Default location: Baguio City, Philippines.

## Develop

Use Node.js 22.12+ (tested on Node 24) and npm:

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

For other machines, omit `--cache /workspace/.npm-cache` or choose a writable directory. The development server defaults to port 5173. No API key, database, or backend is required.

```sh
npm run build
npm run preview
npm test
```

Browser tests use system Chromium at `/usr/bin/chromium`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to another installed Chromium executable when needed. Tests cover weather rendering, city search and selection, unit conversion, persistence, favorites, themes, navigation, error recovery, and mobile overflow. Weather and geocoding responses are intercepted in tests; fixtures are never used in the application.

## Features

- Current weather with feels-like temperature, humidity, wind direction and speed, and surface pressure
- Twelve-hour outlook, seven-day forecast, and a 24-hour interactive temperature chart
- UV index, visibility, precipitation probability, cloud cover, dew point, sunrise, and sunset
- Debounced worldwide city search with cancellation and keyboard navigation
- Interactive OpenStreetMap map, centered on the selected city; no simulated radar layer
- Celsius/Fahrenheit, dark/light themes, favorite cities, and last selected city stored in localStorage
- Manual refresh, retrieval timestamp, and opt-in browser geolocation
- Responsive layouts, reduced-motion support, loading placeholders, and actionable error states

## Data and external services

Forecast: `https://api.open-meteo.com/v1/forecast`.
Search: `https://geocoding-api.open-meteo.com/v1/search`.
Weather requests use `timezone=auto`; all forecast timestamps are interpreted as city-local wall times. Greeting and clock use the returned IANA time zone. Daily UV uses the forecast maximum; visibility and dew point use the current forecast hour. Missing values display a dash. Wind is km/h, pressure is hPa, and visibility is km regardless of temperature preference. Forecasts are model estimates, not guaranteed observations.

The map uses `tile.openstreetmap.org`, with OpenStreetMap attribution. It requires Internet access and follows the provider's public tile policy; use a suitable tile provider before high-traffic production deployment. Hero photographs are stored locally in `public/images` and selected by weather code/daylight. Their Unsplash source photo IDs are sunny: `1464822759023-fed622ff2c3b`, cloudy: `1470770841072-f978cf4d019e`, rainy: `1515694346937-94d85e41e6f0`, stormy: `1504253163759-c23fccaebb55`, night: `1519681393784-d120267933ba`, and snow: `1483664852095-d6cc6870702d`. Prefix each ID with `https://images.unsplash.com/photo-` to view its original source photograph. Fonts load from `fonts.googleapis.com` and `fonts.gstatic.com`, with a system font fallback. Unsplash photographs are provided under the [Unsplash license](https://unsplash.com/license); they are landscape illustrations, not live views of the selected city.

Required network hostnames:

- api.open-meteo.com
- geocoding-api.open-meteo.com
- tile.openstreetmap.org
- images.unsplash.com (only to refresh bundled photography)
- fonts.googleapis.com
- fonts.gstatic.com
- registry.npmjs.org (dependency installation)

No credentials are needed. Browser geolocation requires a secure context (HTTPS or localhost) and permission requested by the user clicking “Use my location.” For device coordinates, the name displays “Your location”; no reverse-geocoding service is used.

## Architecture

`src/services/weatherApi.js` owns API requests. `src/hooks/useWeather.js` manages cancellation, retrieval state, and persistent preferences. `src/utils/weather.js` maps WMO codes and formats city-local values. Components own autocomplete, icons, maps, and charts. Map and chart modules are loaded lazily. `src/App.jsx` coordinates the dashboard and its four views.

## Validation and limitations

The production build and three browser tests pass in the cloud environment. A separate live smoke test successfully retrieved Baguio weather, searched for and selected Tokyo, loaded real OpenStreetMap tiles and local imagery, and rendered the forecast chart without JavaScript runtime errors.

To repeat the live check, start the dev server and run `node scripts/live-smoke.mjs`. In this cloud environment, native Chromium HTTPS requests reject the environment proxy certificate. The live smoke test routes external browser requests through Playwright's Node HTTPS transport, which trusts the platform-provided `NODE_EXTRA_CA_CERTS`, uses the configured proxy, and preserves TLS verification. It forwards actual live responses without fixtures. This verifies live integration through that transport; direct Chromium HTTPS access in the cloud still has a trust limitation. Normal deployment requires standard browser-trusted HTTPS access to the providers. The network domains and reusable install/start instructions were saved to the environment draft; publication remains a user action.

The requested Design #1 reference image was not attached, so the implementation follows the supplied written visual specification. The app contains no hardcoded sample-weather fallback. On network/provider failures it shows an error and retry action instead of invented readings.
