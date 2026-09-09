export const auditUser={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'audit@example.invalid',is_anonymous:true,app_metadata:{provider:'anonymous',providers:['anonymous']},user_metadata:{},created_at:'2026-09-08T00:00:00Z'}
const part=o=>Buffer.from(JSON.stringify(o)).toString('base64url')
export const auditSession={access_token:part({alg:'HS256',typ:'JWT'})+'.'+part({sub:auditUser.id,exp:Math.floor(Date.now()/1000)+86400,role:'authenticated',aud:'authenticated'})+'.audit-signature',refresh_token:'audit-refresh-not-real',token_type:'bearer',expires_in:86400,expires_at:Math.floor(Date.now()/1000)+86400,user:auditUser}
export async function isolateBrowser(context,{signedIn=false}={}){
 await context.route('https://*.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname
  const fulfill=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
  if(path.startsWith('/auth/v1/')){
   if(path.endsWith('/user'))return fulfill(auditUser)
   if(path.endsWith('/logout'))return fulfill({})
   return fulfill(auditSession)
  }
  if(path.startsWith('/rest/v1/')){
   if(req.method()==='GET')return fulfill(req.headers().accept?.includes('vnd.pgrst.object')?{id:auditUser.id,name:null,romanization_enabled:false,language_code:'en-US'}:[])
   if(path.includes('/sessions'))return fulfill({id:'22222222-2222-4222-8222-222222222222'},201)
   return fulfill([],201)
  }
  return fulfill({error:'Audit Supabase request not implemented'},400)
 })
 await context.route(/https:\/\/[^/]*(posthog|sentry)[^/]*\//,r=>r.abort())
 await context.addInitScript(()=>localStorage.setItem('keiro_cookie_consent','declined'))
 if(signedIn)await context.addCookies([{name:'sb-fpvnwlvjpdhzespxyicf-auth-token',value:'base64-'+Buffer.from(JSON.stringify(auditSession)).toString('base64url'),domain:'localhost',path:'/',sameSite:'Lax'}])
}
