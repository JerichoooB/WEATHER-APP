import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {currentWeather} from './currentWeather.js';
const root=fileURLToPath(new URL('../dist',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/current-weather')return currentWeather(req,res);
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 try {
  const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!path.startsWith(root+sep)){res.writeHead(403);return res.end();}
  if(!(await stat(path)).isFile()){res.writeHead(404);return res.end();}
  const body=await readFile(path);res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.writeHead(200);res.end(req.method==='HEAD'?undefined:body);
 }catch {res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('SkyCast server started.'));
