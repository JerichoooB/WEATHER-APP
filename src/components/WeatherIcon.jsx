import {condition} from '../utils/weather';
export default function WeatherIcon({code,day=true,size=28,className=''}) {
 const {Icon,label}=condition(code,day);
 return <Icon size={size} strokeWidth={1.5} aria-label={label} className={`weather-icon ${className}`}/>;
}
