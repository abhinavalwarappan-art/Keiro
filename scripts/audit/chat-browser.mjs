import {chromium,expect} from '@playwright/test'
import fs from 'node:fs/promises'
import {isolateBrowser} from './browser-isolation.mjs'
const out='artifacts/prelaunch-2026-09-08'
const langs=[...(await fs.readFile('src/lib/languages.ts','utf8')).matchAll(/\{ code: '([^']+)', en: '([^']+)', native: '([^']+)'/g)].map(m=>({code:m[1],en:m[2],native:m[3]}))
const browser=await chromium.launch({headless:true})
import {setup} from './chat-setup.mjs'

const results=[]
for(const lang of langs){
 const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});await isolateBrowser(context,{signedIn:true});const page=await context.newPage()
 const r={kind:'language',...lang}
 try{await setup(page,lang,true);await page.locator('#chat-input').fill('Synthetic typed audit');await page.getByRole('button',{name:'Send message',exact:true}).click();await expect(page.getByText('Synthetic typed audit',{exact:true})).toBeVisible();await expect(page.locator('#chat-input')).toBeEnabled();r.pass=true;r.layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,htmlLang:document.documentElement.lang,htmlDir:document.documentElement.dir,inputDir:getComputedStyle(document.querySelector('#chat-input')).direction,logDir:getComputedStyle(document.querySelector('[role="log"]')).direction}));if(['ar-SA','ur-PK','fa-IR','en-US'].includes(lang.code))await page.screenshot({path:`${out}/chat-${lang.code}.png`,fullPage:true})}catch(e){r.pass=false;r.error=e.message}
 console.log(JSON.stringify(r));results.push(r);await context.close();await fs.writeFile(`${out}/chat-browser.json`,JSON.stringify(results,null,2))
}
const uas={ios:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',android:'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'}
for(const platform of ['ios','android'])for(const mode of ['denied','busy','pending','Instagram','Facebook','TikTok']){
 const ua=uas[platform]+(mode==='Facebook'?' FBAN/FBIOS': ['Instagram','TikTok'].includes(mode)?' '+mode:'')
 const context=await browser.newContext({userAgent:ua,viewport:{width:375,height:812}});await isolateBrowser(context,{signedIn:true});const page=await context.newPage();const r={kind:'mic',platform,mode}
 await page.addInitScript(({mode})=>{
  window.auditMic={queries:0,calls:[],permission:'prompt',inClick:false}
  document.addEventListener('click',()=>{window.auditMic.inClick=true;setTimeout(()=>window.auditMic.inClick=false,0)},true)
  Object.defineProperty(navigator,'permissions',{value:{query:async()=>{window.auditMic.queries++;return {state:window.auditMic.permission,addEventListener(){},removeEventListener(){}}}}})
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>{window.auditMic.calls.push({sameTask:window.auditMic.inClick,active:navigator.userActivation.isActive});if(mode==='pending')return new Promise(()=>{});return Promise.reject(new DOMException('Synthetic fault',mode==='busy'?'NotReadableError':'NotAllowedError'))}}})
 },{mode})
 try{
  await setup(page);await page.getByRole('button',{name:'Start voice input',exact:true}).click()
  if(mode!=='pending')await expect(page.locator('[role="alert"]').first()).toBeVisible()
  if(mode==='denied'){
   await page.getByRole('button',{name:/How to turn it on/i}).click();await expect(page.getByRole('dialog')).toBeVisible()
   r.instructions=await page.getByRole('dialog').innerText();r.queriesBefore=await page.evaluate(()=>window.auditMic.queries)
   await page.evaluate(()=>window.auditMic.permission='denied');await page.getByRole('button',{name:'Try again',exact:true}).click();r.queriesAfter=await page.evaluate(()=>window.auditMic.queries)
   r.stillBlocked=await page.getByRole('dialog').innerText()
   let escaped=false;for(let i=0;i<12;i++){await page.keyboard.press('Tab');escaped ||= await page.evaluate(()=>!document.activeElement?.closest('[role="dialog"]'))}r.focusEscapes=escaped
   await page.keyboard.press('Escape')
  }
  r.message=await page.locator('[role="alert"]').allTextContents();r.banner=await page.locator('[role="status"]').allTextContents()
  await page.locator('#chat-input').fill('Typing remains available',{timeout:3000});r.typing=true;r.inputVisible=await page.locator('#chat-input').evaluate(e=>getComputedStyle(e).opacity!=='0');r.sendEnabled=await page.getByRole('button',{name:'Send message',exact:true}).isEnabled();r.trace=await page.evaluate(()=>window.auditMic)
  await page.screenshot({path:`${out}/mic-${platform}-${mode}.png`,fullPage:true});r.pass=true
 }catch(e){r.pass=false;r.error=e.message;r.trace=await page.evaluate(()=>window.auditMic)}
 console.log(JSON.stringify(r));results.push(r);await context.close();await fs.writeFile(`${out}/chat-browser.json`,JSON.stringify(results,null,2))
}
await browser.close()
