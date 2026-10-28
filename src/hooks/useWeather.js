import {useEffect,useRef,useState} from 'react';
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
 const lastSuccess=useRef(0);
 useEffect(()=>{
  const checkFreshness=()=>{if(document.visibilityState==='visible'&&Date.now()-lastSuccess.current>=10*60*1000)setRevision(v=>v+1);};
  const timer=setInterval(checkFreshness,10*60*1000);
  window.addEventListener('focus',checkFreshness);document.addEventListener('visibilitychange',checkFreshness);
  return()=>{clearInterval(timer);window.removeEventListener('focus',checkFreshness);document.removeEventListener('visibilitychange',checkFreshness);};
 },[]);
 useEffect(()=>{
  const controller=new AbortController();
  setState(s=>({...s,data:null,loading:true,error:null}));
  fetchWeather(city,controller.signal).then(data=>{lastSuccess.current=Date.now();setState({data,loading:false,error:null,updated:new Date()});}).catch(error=>{if(error.name!=='AbortError')setState({data:null,loading:false,error:error.message,updated:null});});
  return ()=>controller.abort();
 },[city.latitude,city.longitude,revision]);
 return {...state,refresh:()=>setRevision(v=>v+1)};
}
