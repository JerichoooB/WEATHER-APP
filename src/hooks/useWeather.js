import {useEffect,useState} from 'react';
import {fetchWeather} from '../services/weatherApi';
export function readSaved(key,fallback) {try {return JSON.parse(localStorage.getItem('skycast:'+key)) ?? fallback;} catch {return fallback;}}
export function useSaved(key,fallback) {
 const [state,setState]=useState(()=>readSaved(key,fallback));
 useEffect(()=>{try {localStorage.setItem('skycast:'+key,JSON.stringify(state));}catch {}},[key,state]);
 return [state,setState];
}
export function useWeather(city) {
 const [state,setState]=useState({data:null,loading:true,error:null,updated:null});
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  setState(s=>({...s,data:null,loading:true,error:null}));
  fetchWeather(city,controller.signal).then(data=>setState({data,loading:false,error:null,updated:new Date()})).catch(error=>{if(error.name!=='AbortError')setState({data:null,loading:false,error:error.message,updated:null});});
  return ()=>controller.abort();
 },[city.latitude,city.longitude,revision]);
 return {...state,refresh:()=>setRevision(v=>v+1)};
}
