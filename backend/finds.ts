type Statement={bind(...values:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>};
type Database={prepare(sql:string):Statement;batch(statements:Statement[]):Promise<Array<{meta?:{changes?:number};results?:unknown[]}>>};
const radices=[4,4,7,16,11,12];
function validKey(key:string){const a=key.split('.').map(Number);return a.length===6&&a.every((v,i)=>Number.isInteger(v)&&v>=0&&v<radices[i])&&a.join('.')===key}
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handleFinds(request:Request,db?:Database){
 const url=new URL(request.url),key=url.searchParams.get('key');
 if(request.method!=='GET'&&request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!key||!validKey(key))return json({error:'invalid_cat'},400);
 if(!db)return json({error:'statistics_unavailable'},503);
 try{
  if(request.method==='GET'){const row=await db.prepare('SELECT total FROM cat_counts_p5 WHERE cat_key = ?').bind(key).first<{total:number}>();return json({total:row?.total??0,recorded:false})}
  if(request.headers.get('Origin')!==url.origin)return json({error:'origin_not_allowed'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'invalid_content_type'},415);
  if(Number(request.headers.get('Content-Length')||0)>1024)return json({error:'body_too_large'},413);
  const text=await request.text();if(text.length>1024)return json({error:'body_too_large'},413);
  let data:unknown;try{data=JSON.parse(text)}catch{return json({error:'invalid_json'},400)}
  const body=data as {key?:unknown;visitor?:unknown};
  if(!body||body.key!==key||typeof body.visitor!=='string'||!/^[a-f0-9]{32}$/.test(body.visitor))return json({error:'invalid_submission'},400);
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('kotik-p5:'+body.visitor));
  const visitor=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  // D1 batch is a transaction. changes() refers to the preceding INSERT on
  // this same connection, so duplicate retries cannot increment the count.
  const result=await db.batch([
   db.prepare('INSERT OR IGNORE INTO cat_finds_p5 (visitor, cat_key) VALUES (?, ?)').bind(visitor,key),
   db.prepare('INSERT INTO cat_counts_p5 (cat_key, total) SELECT ?, 1 WHERE changes() = 1 ON CONFLICT(cat_key) DO UPDATE SET total = cat_counts_p5.total + 1').bind(key),
   db.prepare('SELECT total FROM cat_counts_p5 WHERE cat_key = ?').bind(key)
  ]);
  const total=(result[2].results?.[0] as {total?:number}|undefined)?.total;
  if(!Number.isSafeInteger(total)||Number(total)<1)throw Error('missing_count');
  return json({total,recorded:result[0].meta?.changes===1});
 }catch{return json({error:'statistics_unavailable'},503)}
}
