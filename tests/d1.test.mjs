import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mutateD1,readD1} from '../lib/d1-store.mjs';
test('D1 retries stale writes and prevents concurrent overlapping reservations',async()=>{
 let record={content:'[]',version:0};
 const db={prepare(sql){return {async first(){return {...record};},bind(content,version){return {async run(){if(record.version!==version)return {meta:{changes:0}};record={content,version:version+1};return {meta:{changes:1}};}};}};}};
 const request=()=>mutateD1(db,all=>{if(all.length)throw Error('예약 충돌');all.push({id:'one'});return all[0];});
 const results=await Promise.allSettled([request(),request()]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await readD1(db)).all.length,1);
 await assert.rejects(mutateD1(db,all=>{all.push({id:'two'});throw Error('실패');}));assert.equal((await readD1(db)).all.length,1);
});
