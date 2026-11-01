import {DatabaseSync} from 'node:sqlite';import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';import {handleFinds} from '../backend/finds.ts';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../backend/test-schema.sql',import.meta.url),'utf8'));
class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values}bind(...v){return new Statement(this.sql,v)}async first(){return sqlite.prepare(this.sql).get(...this.values)||null}}
const db={prepare(sql){return new Statement(sql)},async batch(statements){sqlite.exec('BEGIN');try{let r=statements.map(s=>{let q=sqlite.prepare(s.sql);if(/^SELECT/.test(s.sql))return{results:q.all(...s.values),meta:{changes:0}};let result=q.run(...s.values);return{meta:{changes:Number(result.changes)},results:[]}});sqlite.exec('COMMIT');return r}catch(e){sqlite.exec('ROLLBACK');throw e}}};
function request(method='GET',visitor='a'.repeat(32),key='0.1.2.3.0.0',extra={}){return new Request('https://cats.test/api/finds?key='+key,{method,headers:{Origin:'https://cats.test','Content-Type':'application/json',...extra},...(method==='POST'?{body:JSON.stringify({key,visitor})}:{})})}
let r=await handleFinds(request(),db);assert.equal((await r.json()).total,0);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM cat_finds_p5').get().n,0);
r=await handleFinds(request('POST'),db);assert.deepEqual(await r.json(),{total:1,recorded:true});
r=await handleFinds(request('POST'),db);assert.deepEqual(await r.json(),{total:1,recorded:false});
r=await handleFinds(request('POST','b'.repeat(32)),db);assert.deepEqual(await r.json(),{total:2,recorded:true});
r=await handleFinds(request('POST','a'.repeat(32),'0.1.2.3.1.0'),db);assert.deepEqual(await r.json(),{total:1,recorded:true});
for(let i=0;i<10;i++)assert.equal((await(await handleFinds(request(),db)).json()).total,2);
assert.equal((await handleFinds(request('POST','c'.repeat(32),'0.1.2.3.0.0',{Origin:'https://evil.test'}),db)).status,403);
assert.equal((await handleFinds(request('POST','bad'),db)).status,400);assert.equal((await handleFinds(request('GET','',"0' OR 1=1"),db)).status,400);
assert.equal((await handleFinds(request('POST','d'.repeat(32),'0.1.2.3.0.0',{'Content-Type':'text/plain'}),db)).status,415);
assert.equal((await handleFinds(request('DELETE'),db)).status,405);assert.equal((await handleFinds(request(),undefined)).status,503);
assert.equal((await handleFinds(new Request('https://cats.test/api/finds?key=0.1.2.3.0.0',{method:'POST',headers:{Origin:'https://cats.test','Content-Type':'application/json'},body:'{'}),db)).status,400);
assert.equal(sqlite.prepare('SELECT visitor FROM cat_finds_p5 LIMIT 1').get().visitor.length,64);
// Concurrent callers are serialized by SQLite transactions, mirroring D1 batch.
let counts=await Promise.all(Array.from({length:25},(_,i)=>handleFinds(request('POST',i.toString(16).padStart(32,'0'),'3.3.6.15.10.11'),db).then(r=>r.json())));assert.equal(Math.max(...counts.map(v=>v.total)),25);assert.equal((await(await handleFinds(request('GET','','3.3.6.15.10.11'),db)).json()).total,25);
console.log('Counter checks passed: real SQLite transactions, first discovery, duplicates, new browsers/cats, read-only links, 25 concurrent completions, invalid input, origin, unavailable DB.');sqlite.close();
