import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {currentWeather} from './server/currentWeather.js';
export default defineConfig({ plugins: [react(), tailwindcss(), {name:'skycast-current-weather',configureServer(server){server.middlewares.use((req,res,next)=>{if(new URL(req.url,'http://localhost').pathname==='/api/current-weather')return currentWeather(req,res);next();});}}] });
