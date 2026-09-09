import subprocess,re,json,pathlib
root=pathlib.Path('.')
files=subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
refs={}
for name in files:
 p=root/name
 if p.is_file() and p.suffix in ['.ts','.tsx','.js','.mjs'] and not name.startswith('scripts/audit/'):
  for v in re.findall(r'(?:process\.env\.|\benv\.)([A-Z][A-Z_0-9]+)',p.read_text(errors='replace')): refs.setdefault(v,[]).append(name)
example=set(re.findall(r'^([A-Z][A-Z_0-9]+)=',pathlib.Path('.env.example').read_text(),re.M))
env={}
for name in ['.env.local','.env.production.local']:
 p=root/name
 if p.exists():
  for k,v in re.findall(r'^([A-Z][A-Z_0-9]+)=(.*)$',p.read_text(),re.M):env[k]=v.strip().strip('\"\'')
secret_values={k:v for k,v in env.items() if len(v)>15 and not k.startswith('NEXT_PUBLIC_') and any(x in k for x in ['KEY','TOKEN','SECRET'])}
patterns=[('google_key',rb'AIza[0-9A-Za-z_-]{35}'),('private_key',rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),('github_token',rb'gh[pousr]_[A-Za-z0-9]{30,}'),('provider_key',rb'(?:sk-proj-|sk-ant-|gsk_|re_)[A-Za-z0-9_-]{24,}')]
hits=[];scanned=0
objs=subprocess.check_output(['git','rev-list','--objects','--all']).decode().splitlines()
proc=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE)
for line in objs:
 oid,_,path=line.partition(' ')
 proc.stdin.write((oid+'\n').encode());proc.stdin.flush();h=proc.stdout.readline().decode().split()
 if len(h)<3:continue
 data=proc.stdout.read(int(h[2]));proc.stdout.read(1)
 if h[1]!='blob':continue
 scanned+=1
 for kind,pat in patterns:
  if re.search(pat,data):hits.append({'object':oid,'path':path,'kind':kind})
 for k,v in secret_values.items():
  if v.encode() in data:hits.append({'object':oid,'path':path,'kind':'exact_local_secret:'+k})
proc.stdin.close();proc.wait()
bundlehits=[];bundles=list(pathlib.Path('.next/static').rglob('*'))
for p in bundles:
 if p.is_file():
  d=p.read_bytes()
  for k,v in secret_values.items():
   if v.encode() in d:bundlehits.append({'path':str(p),'variable':k})
report={'envReferences':refs,'missingExample':sorted(set(refs)-example),'exampleNotReferenced':sorted(example-set(refs)),'localVariableNames':sorted(env),'fishConfiguredLocally':bool(env.get('FISH_AUDIO_API_KEY')),'fishVoiceConfiguredLocally':bool(env.get('FISH_AUDIO_VOICE')),'historyBlobsScanned':scanned,'historyFindings':hits,'clientBundleSecretFindings':bundlehits,'clientFilesScanned':len([p for p in bundles if p.is_file()])}
pathlib.Path('artifacts/prelaunch-2026-09-08/source-scan.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['envReferences','localVariableNames']},indent=2))
