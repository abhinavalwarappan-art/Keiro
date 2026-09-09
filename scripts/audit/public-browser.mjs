import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fs from 'node:fs/promises'
const out='artifacts/prelaunch-2026-09-08'
const routes=['/','/about','/accessibility','/auth','/auth/reset-password','/contact','/emergency','/for-clinics','/how-it-works','/languages','/meet-kai','/onboarding','/onboarding/confirm','/privacy-safety','/privacy','/report','/terms','/feedback','/chat','/history','/settings']
const browser=await chromium.launch({headless:true})
const results=[]
for(const origin of (process.env.AUDIT_ORIGIN ? [process.env.AUDIT_ORIGIN] : ['https://keiro.app','http://localhost:3100'])) {
 const context=await browser.newContext({reducedMotion:'reduce'})
 await context.route('**/*',r=> ['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
 await context.addInitScript(()=>localStorage.setItem('keiro_cookie_consent','declined'))
 const page=await context.newPage()
 for(const width of [375,414,768,1440]) {
  await page.setViewportSize({width,height:width===768?1024:900})
  for(const route of routes){
   const item={origin,route,width};const errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener)
   try{
    const res=await page.goto(origin+route,{waitUntil:'networkidle',timeout:25000});await page.evaluate(()=>document.fonts.ready)
    item.status=res.status();item.finalUrl=page.url();item.errors=errors
    item.metrics=await page.evaluate(()=>{
     const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&Number(s.opacity)>0}
     const pairs=new Map();const uncertain=[]
     const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});const rgb=s=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=s;ctx.fillRect(0,0,1,1);const d=[...ctx.getImageData(0,0,1,1).data];return [...d.slice(0,3),d[3]/255]}
     const blend=(f,b)=>f.slice(0,3).map((v,i)=>v*(f[3]??1)+b[i]*(1-(f[3]??1)))
     const lum=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
     for(const e of document.querySelectorAll('body *')){
      if(!visible(e)||!Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue
      let bg=[255,255,255],chain=[],gradient=false;for(let p=e;p;p=p.parentElement)chain.unshift(p)
      for(const p of chain){let s=getComputedStyle(p);gradient ||= s.backgroundImage!=='none'||Number(s.opacity)<1;const c=rgb(s.backgroundColor);if(c)bg=blend(c,bg)}
      const s=getComputedStyle(e),fg=blend(rgb(s.color),bg), l1=lum(fg),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)
      const required=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700)?3:4.5
      const key=fg.map(Math.round)+'/'+bg.map(Math.round)+'/'+required
      if(!pairs.has(key))pairs.set(key,{foreground:fg.map(Math.round),background:bg.map(Math.round),ratio:Number(ratio.toFixed(3)),required,pass:ratio>=required,uncertain:gradient,sample:e.textContent.trim().slice(0,90),font:s.fontFamily})
      if(gradient)uncertain.push(e.textContent.trim().slice(0,40))
     }
     const controls=Array.from(document.querySelectorAll('a,button,input,textarea,select,[role="button"]')).filter(visible).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {label:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||e.tagName).trim().slice(0,70),width:+r.width.toFixed(1),height:+r.height.toFixed(1),disabled:!!e.disabled,color:s.color,background:s.backgroundColor}})
     return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,bodyFont:getComputedStyle(document.body).fontFamily,mainFont:getComputedStyle(document.querySelector('main')||document.body).fontFamily,headingFont:getComputedStyle(document.querySelector('h1')||document.body).fontFamily,canvas:getComputedStyle(document.documentElement).getPropertyValue('--canvas'),brand:getComputedStyle(document.documentElement).getPropertyValue('--brand-ink'),pairs:[...pairs.values()],smallTargets:controls.filter(c=>c.width<44||c.height<44),controls,dir:document.documentElement.dir}
    })
    if(width===375||width===1440){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();item.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));item.incomplete=axe.incomplete.filter(v=>v.id==='color-contrast').map(v=>({id:v.id,count:v.nodes.length}))}
    if(['/', '/onboarding','/chat','/contact','/emergency'].includes(route)&&[375,1440].includes(width))await page.screenshot({path:`${out}/${origin.includes('localhost')?'local':origin.includes('space')?'space':'live'}-${route.replaceAll('/','')||'home'}-${width}.png`,fullPage:true})
    console.log(JSON.stringify({origin,route,width,status:item.status,overflow:item.metrics.scrollWidth>width,axe:item.axe?.map(v=>v.id)}))
   }catch(e){item.failure=e.message;console.log('FAIL',origin,route,width,e.message.slice(0,150))}
   page.off('pageerror',listener);results.push(item);await fs.writeFile(`${out}/${process.env.AUDIT_ORIGIN?.includes('localhost') ? 'public-fixed' : process.env.AUDIT_ORIGIN ? 'space-browser' : 'public-browser'}.json`,JSON.stringify(results,null,2))
  }
 }
 await context.close()
}
await browser.close()
