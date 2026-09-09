import fs from 'node:fs/promises'
import {auditSession} from './browser-isolation.mjs'
const base='http://localhost:3101',out='artifacts/prelaunch-2026-09-08'
const cookie='sb-fpvnwlvjpdhzespxyicf-auth-token=base64-'+Buffer.from(JSON.stringify(auditSession)).toString('base64url')
const results=[]
const control=async o=>fs.writeFile('/tmp/keiro-audit-control.json',JSON.stringify({...o,run:crypto.randomUUID()}))
async function call(path,{body='{}',auth=true,origin=base,method='POST',form=false}={}){let r=await fetch(base+path,{method,headers:{...(form?{}:{'content-type':'application/json'}),'origin':origin,'x-forwarded-for':'192.0.2.123',...(auth?{cookie}:{})},...(method==='GET'?{}:{body})});return {status:r.status,body:(await r.text()).slice(0,500)}}
for(const path of ['/api/chat','/api/report','/api/translate','/api/tts','/api/transcribe','/api/contact','/api/mic-diagnostics','/api/report/pdf']){
 await control({});results.push({path,test:'invalid-json',...await call(path,{body:'{'})})
 await control({});results.push({path,test:'cross-origin',...await call(path,{origin:'https://untrusted.invalid'})})
 await control({dbError:true});results.push({path,test:'db-failure-authenticated',...await call(path,{body:path==='/api/contact'?JSON.stringify({clinicName:'Synthetic Audit',contactName:'Audit',email:'audit@example.invalid'}):path==='/api/mic-diagnostics'?JSON.stringify({errorKind:'denied',source:'getUserMedia'}):'{}'})})
}
for(const path of ['/api/tts','/api/transcribe','/api/mic-diagnostics']){
 await control({dbError:true});results.push({path,test:'db-failure-unauthenticated',...await call(path,{auth:false,body:path==='/api/tts'?JSON.stringify({text:'Synthetic audit'}):path==='/api/mic-diagnostics'?JSON.stringify({errorKind:'denied',source:'getUserMedia'}):'{}'})})
}
await control({});let statuses=[];for(let i=0;i<31;i++)statuses.push((await call('/api/chat')).status);results.push({path:'/api/chat',test:'31-requests-in-memory-rpc',statuses})
await control({});statuses=[];for(let i=0;i<6;i++)statuses.push((await call('/api/contact',{auth:false,body:JSON.stringify({clinicName:'Synthetic Audit',contactName:'Audit',email:'audit@example.invalid'})})).status);results.push({path:'/api/contact',test:'six-requests-in-memory-rpc-email-mocked',statuses})
for(const fish of ['timeout','malformed','rate']){
 await control({fish});let f=new FormData();f.append('audio',new Blob(['fake'],{type:'audio/wav'}),'test.wav');f.append('langCode','en-US');results.push({path:'/api/transcribe',test:'fish-'+fish,...await call('/api/transcribe',{body:f,form:true})})
}
await control({});await fs.writeFile(`${out}/api-probes.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))
