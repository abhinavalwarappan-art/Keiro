const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const colors={paper:'#FAF7F0',ink:'#243C3A',pine:'#315E55',sage:'#E8EFE8',slate:'#52635E',blue:'#245A81'};
const lum=h=>{const v=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return +((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};
(async()=>{
 const browser=await chromium.launch(); const context=await browser.newContext(); const page=await context.newPage(); const report={contrast:[],layouts:[],rtl:[],checks:[]};
 for(const [fg,bg] of [['ink','paper'],['paper','pine'],['slate','paper'],['blue','paper'],['ink','sage'],['slate','sage'],['paper','ink'],['pine','paper'],['blue','sage']]) report.contrast.push({fg,bg,ratio:ratio(colors[fg].slice(1),colors[bg].slice(1))});
 await page.goto('http://localhost:3000'); await page.waitForTimeout(1800); await page.addStyleTag({content:'nextjs-portal { display: none; }'});
 for(const width of [375,768,1024,1440]){
  await page.setViewportSize({width,height:900}); await page.screenshot({path:`artifacts/redesign/${width}.png`,fullPage:true});
  report.layouts.push(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,headline:getComputedStyle(document.querySelector('h1')).fontSize,targets:[...document.querySelectorAll('.keiro-language,.keiro-primary')].map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}))})));
 }
 await page.setViewportSize({width:375,height:900});
 report.axe=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
 for(const code of ['ar-SA','ur-PK','fa-IR']){
  await page.locator(`.keiro-language:has([lang="${code}"])`).click();
  report.rtl.push({code,...await page.locator('.keiro-exchange').evaluate(el=>({lang:el.lang,dir:el.dir,direction:getComputedStyle(el).direction})),announcement:await page.locator('.keiro-demo > [role="status"]').innerText(),noteDirection:await page.locator('.keiro-note').getAttribute('dir')});
 }
 await page.screenshot({path:'artifacts/redesign/375-rtl.png',fullPage:true});
 await page.locator('.keiro-language').first().focus(); await page.keyboard.press('Tab'); report.focus=await page.evaluate(()=>({text:document.activeElement.textContent,outline:getComputedStyle(document.activeElement).outline,offset:getComputedStyle(document.activeElement).outlineOffset}));
 await page.keyboard.press('Space'); report.keyboardSelection=await page.locator('.keiro-language[aria-pressed="true"]').innerText();

 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 await page.locator('#mobile-menu a').first().focus(); await page.keyboard.press('Escape');
 report.menuEscape=await page.getByRole('button',{name:'Open menu',exact:true}).evaluate(el=>document.activeElement===el);
 await page.getByRole('button',{name:'Search all 45 languages',exact:true}).click();
 const search=page.getByRole('searchbox'); await search.fill('tieng');
 report.search=await page.locator('.keiro-language').allTextContents();
 await search.fill('unlikely-language'); report.noMatch=await page.locator('#language-search [role="status"]').innerText();
 await search.fill('');
 report.allLanguageAttributes=await page.locator('.keiro-language > span:first-child').evaluateAll(els=>els.length===45 && els.every(el=>!!el.lang));
 await page.getByRole('button',{name:'Show common languages',exact:true}).click();
 report.textPairs=await page.evaluate(()=>{
   const pairs=new Map();
   for(const el of document.querySelectorAll('.lx *, .keiro-consent *')) {
     if(!el.getBoundingClientRect().width || ![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) continue;
     let bg='rgb(255, 255, 255)',parent=el;
     while(parent) { const c=getComputedStyle(parent).backgroundColor; if(c!=='rgba(0, 0, 0, 0)' && c!=='transparent'){bg=c;break;}parent=parent.parentElement; }
     const fg=getComputedStyle(el).color; pairs.set(`${fg}/${bg}`,{fg,bg});
   }
   return [...pairs.values()];
 });
 for(const pair of report.textPairs) { const hex=rgb=>rgb.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join(''); pair.ratio=ratio(hex(pair.fg),hex(pair.bg)); }
 report.normalIdleAnimations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 await page.emulateMedia({reducedMotion:'reduce'}); await page.locator('.keiro-language').first().click(); report.reduced=await page.locator('.keiro-language-change').evaluate(el=>getComputedStyle(el).animationName);
 report.screenReaderTree=await page.locator('.keiro-demo').ariaSnapshot();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%'); await page.waitForTimeout(100); report.enlargement=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bodyText:getComputedStyle(document.querySelector('.keiro-intro > p:last-child')).fontSize,offscreen:[...document.querySelectorAll('.lx a,.lx button,.lx p,.lx h1,.lx h2,.keiro-consent button')].filter(el=>el.getBoundingClientRect().width && (el.getBoundingClientRect().right>innerWidth+1||el.getBoundingClientRect().left< -1)).map(el=>el.textContent)}));
 await page.screenshot({path:'artifacts/redesign/375-200percent.png',fullPage:true});
 report.idleAnimations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 await page.evaluate(()=>document.documentElement.style.fontSize='');
 await page.setViewportSize({width:320,height:900}); report.reflow320=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
 fs.writeFileSync('artifacts/redesign/verification.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); if(report.axe.length || report.textPairs.some(p=>p.ratio<4.5) || report.enlargement.offscreen.length || report.enlargement.bodyText !== '40px') process.exitCode=1; await browser.close();
})();
