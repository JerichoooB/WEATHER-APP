import {test,expect} from '@playwright/test';
function forecast() {
 const time=Array.from({length:168},(_,i)=>new Date(Date.UTC(2026,9,27,i)).toISOString().slice(0,16));
 // Fixed provider-shaped fixtures are used only by tests, never application fallbacks.
 return {timezone:'Asia/Manila',current:{time:time[16],temperature_2m:18,apparent_temperature:17,relative_humidity_2m:82,is_day:1,weather_code:2,cloud_cover:40,surface_pressure:850,wind_speed_10m:8,wind_direction_10m:90},hourly:{time,temperature_2m:time.map((_,i)=>18+Math.sin(i)*3),weather_code:time.map(()=>2),precipitation_probability:time.map(()=>20),visibility:time.map(()=>12000),dew_point_2m:time.map(()=>14),is_day:time.map((_,i)=>i%24>=6&&i%24<18?1:0)},daily:{time:Array.from({length:7},(_,i)=>new Date(Date.UTC(2026,9,27+i)).toISOString().slice(0,10)),weather_code:Array(7).fill(2),temperature_2m_max:Array(7).fill(23),temperature_2m_min:Array(7).fill(16),sunrise:Array(7).fill('2026-10-27T05:50'),sunset:Array(7).fill('2026-10-27T17:40'),uv_index_max:Array(7).fill(6),precipitation_probability_max:Array(7).fill(20)}};
}
async function mock(page) {
 await page.route('https://api.open-meteo.com/**',r=>r.fulfill({json:forecast()}));
 await page.route('https://geocoding-api.open-meteo.com/**',r=>r.fulfill({json:{results:[{id:1,name:'Tokyo',admin1:'Tokyo',country:'Japan',latitude:35.68,longitude:139.69}]}}));
 await page.route(/https:\/\/(images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com|tile\.openstreetmap\.org)\//,r=>r.abort());
}
test('dashboard updates units, city, favorites, theme, forecast, map and persisted preferences',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mock(page);await page.goto('/');
 await expect(page.getByRole('heading',{name:'Baguio City',exact:true})).toBeVisible();
 await expect(page.locator('.temperature-line')).toContainText('18°');
 await expect(page.locator('.hour')).toHaveCount(12);await expect(page.locator('.week-row')).toHaveCount(7);
 await page.getByRole('button',{name:'°F',exact:true}).click();await expect(page.locator('.temperature-line')).toContainText('64°');
 await page.getByLabel('Search cities').fill('Tokyo');await page.getByRole('option').click();await expect(page.getByRole('heading',{name:'Tokyo',exact:true})).toBeVisible();
 await page.getByLabel('Save favorite city').click();await expect(page.locator('.favorites')).toContainText('Tokyo');
 await page.getByLabel('Switch to light theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'View more'}).click();await expect(page.getByRole('heading',{name:'Temperature trend'})).toBeVisible();
 await page.getByRole('button',{name:'Maps',exact:true}).click();await expect(page.locator('.full-map .leaflet-container')).toBeVisible();
 await page.getByRole('button',{name:'About',exact:true}).click();await expect(page.getByRole('heading',{name:'Weather, with a little perspective.'})).toBeVisible();
 await page.reload();await expect(page.locator('.temperature-line')).toContainText('64°');await expect(page.getByRole('heading',{name:'Tokyo',exact:true})).toBeVisible();
 await page.getByLabel('Open settings').click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(errors).toEqual([]);
});
test('handles provider errors without inventing weather',async({page})=>{
 await mock(page);await page.route('https://api.open-meteo.com/**',r=>r.fulfill({status:503,json:{error:true}}));await page.goto('/');
 await expect(page.getByRole('alert')).toContainText('couldn’t retrieve');await expect(page.locator('.temperature-line')).toHaveCount(0);
 await page.route('https://api.open-meteo.com/**',r=>r.fulfill({json:forecast()}));await page.getByRole('button',{name:'Try again'}).click();await expect(page.locator('.temperature-line')).toContainText('18°');
});
test('mobile dashboard fits viewport and navigation works',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mock(page);await page.goto('/');await expect(page.locator('.hour')).toHaveCount(12);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByLabel('Toggle navigation').click();await page.getByRole('button',{name:'Forecast',exact:true}).click();await expect(page.getByRole('heading',{name:'Temperature trend'})).toBeVisible();
 await page.screenshot({path:'/tmp/skycast-mobile.png',fullPage:true});
});
