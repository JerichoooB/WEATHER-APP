import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox'],...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}}:{})});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>console.log('Request failed:',new URL(r.url()).hostname,r.failure()?.errorText));
 // Use Playwright's Node HTTPS transport when a cloud proxy is present.
 // It honors NODE_EXTRA_CA_CERTS while preserving certificate verification.
 if(process.env.HTTPS_PROXY) await page.route(/^https:\/\//,async route=>{try {await route.fulfill({response:await route.fetch()});}catch(error){console.error('HTTPS transport:',error.message);await route.abort();}});
 await page.goto('http://127.0.0.1:5173/');await page.locator('.temperature-line').waitFor({timeout:30000});
 assert.equal(await page.locator('.hour').count(),12);assert.equal(await page.locator('.week-row').count(),7);
 await page.getByRole('button',{name:'Try again'}).count().then(n=>{if(n)throw new Error('Live current conditions are unavailable. Configure WEATHERAPI_KEY on the server before this check.');});
 console.log('Live Baguio weather:',await page.locator('.temperature-line').innerText());
 await page.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(i=>i.complete&&i.naturalWidth>0),{},{timeout:20000});
 await page.evaluate(async()=>{const img=new Image();img.src=getComputedStyle(document.querySelector('.hero')).backgroundImage.slice(5,-2);await img.decode();});
 await page.screenshot({path:'/tmp/skycast-desktop.png',fullPage:true});
 await page.getByLabel('Search cities').fill('Tokyo');await page.getByRole('option').first().waitFor({timeout:20000});await page.getByRole('option').first().click();await page.locator('.temperature-line').waitFor({timeout:30000});
 assert.match(await page.locator('.hero h1').innerText(),/Tokyo/);
 await page.getByRole('button',{name:'View more'}).click();await page.locator('.recharts-area').waitFor();
 assert.deepEqual(errors,[]);console.log('Live city search, forecast, image, map tiles, and chart passed. No runtime errors.');
} finally {await browser.close();}
