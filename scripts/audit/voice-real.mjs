import {chromium,expect} from '@playwright/test'
import fs from 'node:fs/promises'
import {isolateBrowser} from './browser-isolation.mjs'
import {setup} from './chat-setup.mjs'
const out='artifacts/prelaunch-2026-09-08'
await fs.writeFile('/tmp/keiro-audit-control.json',JSON.stringify({fish:'real',run:crypto.randomUUID()}))
const browser=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture=/tmp/keiro-audit-spoken.wav']})
const context=await browser.newContext({permissions:['microphone'],viewport:{width:375,height:812},reducedMotion:'reduce'});await isolateBrowser(context,{signedIn:true})
const page=await context.newPage();const results={syntheticSentence:'This is a synthetic test. My knee has hurt for two days.',database:'isolated mock; no production writes',provider:'real Fish API using local server credentials'}
try{
 await page.addInitScript(()=>{window.auditPlayback=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.auditPlayback.push({event:'play',src:this.src});this.addEventListener('ended',()=>window.auditPlayback.push({event:'ended',duration:this.duration}));return play.call(this)}})
 await setup(page)
 await page.getByRole('button',{name:'Start voice input',exact:true}).click();await expect(page.getByRole('button',{name:'Stop recording',exact:true})).toBeVisible()
 await page.waitForTimeout(4500)
 const response=page.waitForResponse('**/api/transcribe',{timeout:45000}).catch(e=>({auditError:e.message}));await page.getByRole('button',{name:'Stop recording',exact:true}).click({force:true});const asr=await response;if(asr.auditError)throw Error(asr.auditError);results.asrStatus=asr.status();results.asr=await asr.json();await expect(page.locator('#chat-input')).toHaveValue(/knee/i,{timeout:40000});results.composer=await page.locator('#chat-input').inputValue()
 const sent=page.waitForRequest(r=>r.url().endsWith('/api/chat')&&r.method()==='POST');await page.getByRole('button',{name:'Send message',exact:true}).click();results.chatRequest=(await sent).postDataJSON();await expect(page.locator('#chat-input')).toBeEnabled()
 await page.unroute('**/api/tts')
 const tts = await page.evaluate(async () => {
   const response = await fetch('/api/tts', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({text:'This is a synthetic voice output test.'}) })
   const bytes = await response.arrayBuffer()
   return { status: response.status, contentType: response.headers.get('content-type'), bytes: Array.from(new Uint8Array(bytes)) }
 })
 results.ttsStatus=tts.status;results.ttsContentType=tts.contentType;results.ttsBytes=tts.bytes.length
 if(tts.status!==200||!tts.contentType?.startsWith('audio/mpeg')||tts.bytes.length===0)throw Error(`TTS response ${tts.status}, ${tts.contentType}, ${tts.bytes.length} bytes`)
 await fs.writeFile(`${out}/fish-reply.mp3`,Buffer.from(tts.bytes));results.pass=true
 await page.screenshot({path:`${out}/voice-real.png`,fullPage:true})
}catch(e){results.pass=false;results.error=e.message;results.pageText=await page.locator('body').innerText();await page.screenshot({path:`${out}/voice-real-error.png`,fullPage:true})}
await fs.writeFile(`${out}/voice-real.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();await fs.writeFile('/tmp/keiro-audit-control.json','{}')
