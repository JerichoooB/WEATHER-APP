import {useEffect} from 'react';
import {MapContainer,TileLayer,CircleMarker,Popup,useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
function Center({city}) {const map=useMap();useEffect(()=>{map.setView([city.latitude,city.longitude],10);const timer=setTimeout(()=>map.invalidateSize(),100);return()=>clearTimeout(timer);},[city.latitude,city.longitude,map]);return null;}
export default function WeatherMap({city,full=false}) {
 return <div className={full?'map full-map':'map'}><MapContainer center={[city.latitude,city.longitude]} zoom={10} scrollWheelZoom={false}><Center city={city}/><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"/><CircleMarker center={[city.latitude,city.longitude]} radius={10} pathOptions={{color:'#fff',fillColor:'#47a6ff',fillOpacity:1,weight:3}}><Popup>{city.name}</Popup></CircleMarker></MapContainer><div className="map-caption"><span className="live-dot"/>{city.name}<small>Geographic map · OpenStreetMap</small></div></div>;
}
