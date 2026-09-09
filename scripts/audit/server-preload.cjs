// Local audit only. Never deploy or preload this in a production environment.
const fs = require('node:fs')
if (process.env.VERCEL || process.env.AUDIT_ISOLATED !== 'true') throw Error('Audit preload requires an explicitly isolated local process')
const realFetch=globalThis.fetch
const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'audit@example.invalid',is_anonymous:true,app_metadata:{provider:'anonymous',providers:['anonymous']},user_metadata:{},created_at:'2026-09-08T00:00:00Z'}
const counts=new Map()
globalThis.fetch=async(input,init={})=>{
 const url=new URL(typeof input==='string'?input:input.url||String(input))
 let control={};try{control=JSON.parse(fs.readFileSync('/tmp/keiro-audit-control.json','utf8'))}catch{}
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}})
 if(url.hostname.endsWith('.supabase.co')){
  if(url.pathname.includes('/auth/v1/user'))return control.authError?json({message:'Audit auth unavailable',code:'unexpected_failure'},503):json(user)
  if(url.pathname.includes('/rest/v1/rpc/')){
   const fn=url.pathname.split('/').pop();const body=JSON.parse(init.body||'{}')
   if(control.dbError)return json({message:'AUDIT database unavailable',code:'XX000'},500)
   if(fn==='record_mic_diagnostic')return json(null)
   const key=(control.run||'default')+fn+(body.p_endpoint||'contact')+(body.p_user_id||body.p_ip_hash)
   const n=counts.get(key)||0;counts.set(key,n+1)
   return json(control.deny?false:n<(body.p_limit||5))
  }
  if(url.pathname.includes('/rest/v1/'))return json([])
  return json({error:'Unimplemented isolated Supabase request'},400)
 }
 if(url.hostname==='api.fish.audio'){
  if(control.fish==='real')return realFetch(input,init)
  if(control.fish==='timeout')throw new DOMException('Audit timeout','TimeoutError')
  if(control.fish==='malformed')return json({unexpected:true})
  if(control.fish==='rate')return json({error:'AUDIT provider detail must not leak'},429)
  return json({error:'AUDIT unavailable'},503)
 }
 if(url.hostname==='api.resend.com')return json({id:'audit-email-mocked-not-sent'})
 if(url.hostname==='generativelanguage.googleapis.com')return json({error:'Audit AI disabled'},503)
 // Block every other outbound destination; no telemetry or accidental external writes.
 if(!['localhost','127.0.0.1'].includes(url.hostname))return json({error:'Audit outbound blocked'},503)
 return realFetch(input,init)
}
