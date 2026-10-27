import {useEffect,useRef,useState} from 'react';
import {Search,LoaderCircle,MapPin} from 'lucide-react';
import {AnimatePresence,motion} from 'motion/react';
import {searchCities} from '../services/weatherApi';
export default function SearchBar({onSelect}) {
 const [query,setQuery]=useState(''),[results,setResults]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const root=useRef(null);
 useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 useEffect(()=>{
  const controller=new AbortController();setResults([]);setError('');setActive(-1);setLoading(query.trim().length>=2);
  if(query.trim().length<2)return()=>controller.abort();
  const timer=setTimeout(()=>searchCities(query.trim(),controller.signal).then(items=>{setResults(items);if(!items.length)setError('No cities found. Try a nearby city.');}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);}),350);
  return()=>{clearTimeout(timer);controller.abort();};
 },[query]);
 const select=c=>{onSelect(c);setQuery('');setOpen(false);};
 return <div className="search-wrap" ref={root}><div className="search-field"><Search size={17}/><input aria-label="Search cities" role="combobox" aria-autocomplete="list" aria-controls="city-results" aria-expanded={open&&query.length>=2} aria-activedescendant={active>=0?`city-${active}`:undefined} placeholder="Search for a city…" value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);if(e.key==='ArrowDown'){e.preventDefault();setActive(i=>Math.min(i+1,results.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(0,i-1));}if(e.key==='Enter'&&results[active])select(results[active]);}}/>{loading&&<LoaderCircle size={16} className="animate-spin"/>}</div><AnimatePresence>{open&&query.length>=2&&<motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="search-results" id="city-results" role="listbox">{loading&&<p>Finding your city…</p>}{error&&<p role="status">{error}</p>}{results.map((c,i)=><button key={c.id} id={`city-${i}`} role="option" aria-selected={active===i} className={active===i?'selected':''} onClick={()=>select(c)}><MapPin size={17}/><span><strong>{c.name}</strong><small>{[c.admin1,c.country].filter(Boolean).join(', ')}</small></span></button>)}</motion.div>}</AnimatePresence></div>;
}
