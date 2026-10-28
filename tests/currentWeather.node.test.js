import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {currentWeather} from '../server/currentWeather.js';
test('WeatherAPI server validates input, protects the key, caches success, and reports upstream errors',async()=>{
 const originalFetch=globalThis.fetch,previousKey=process.env.WEATHERAPI_KEY;
 const server=createServer(currentWeather);server.listen(0,'127.0.0.1');await once(server,'listening');
 const url=`http://127.0.0.1:${server.address().port}`;
 try {
  delete process.env.WEATHERAPI_KEY;
  let response=await originalFetch(url+'/?latitude=16&longitude=120');assert.equal(response.status,503);assert.match((await response.json()).error,/not connected/);
  response=await originalFetch(url+'/?latitude=NaN&longitude=120');assert.equal(response.status,400);
  response=await originalFetch(url+'/?latitude=&longitude=120');assert.equal(response.status,400);
  response=await originalFetch(url+'/?latitude=91&longitude=120');assert.equal(response.status,400);
  response=await originalFetch(url,{method:'POST'});assert.equal(response.status,405);
  process.env.WEATHERAPI_KEY='test-only-placeholder';let calls=0;
  globalThis.fetch=async target=>{calls++;const parsed=new URL(target);assert.equal(parsed.hostname,'api.weatherapi.com');assert.equal(parsed.searchParams.get('key'),'test-only-placeholder');return Response.json({current:{temp_c:18,last_updated_epoch:1793097600,condition:{code:1003,text:'Partly cloudy'},humidity:80},location:{name:'Private unused field'}});};
  response=await originalFetch(url+'/?latitude=16&longitude=120');assert.equal(response.status,200);const text=await response.text();assert.ok(!text.includes('test-only-placeholder'));assert.ok(!text.includes('Private unused field'));assert.equal(JSON.parse(text).current.temp_c,18);
  response=await originalFetch(url+'/?latitude=16&longitude=120');assert.equal(response.status,200);assert.equal(calls,1);
  globalThis.fetch=async()=>new Response('',{status:401});response=await originalFetch(url+'/?latitude=17&longitude=120');assert.equal(response.status,502);assert.match((await response.json()).error,/rejected/);
  globalThis.fetch=async()=>{throw new Error('internal details must not be exposed');};response=await originalFetch(url+'/?latitude=18&longitude=120');assert.equal(response.status,502);assert.ok(!(await response.text()).includes('internal details'));
 } finally {
  globalThis.fetch=originalFetch;if(previousKey===undefined)delete process.env.WEATHERAPI_KEY;else process.env.WEATHERAPI_KEY=previousKey;
  await new Promise(resolve=>server.close(resolve));
 }
});
