import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {validate,overlaps} from './domain.mjs';
import {readD1,mutateD1} from './d1-store.mjs';
async function database(){if(process.env.BOOKING_STORAGE!=='d1')return null;const {getCloudflareContext}=await import('@opennextjs/cloudflare');const {env}=getCloudflareContext();if(!env.BOOKINGS_DB)throw new Error('예약 DB 연결이 필요합니다.');return env.BOOKINGS_DB;}
const file=path.resolve(process.env.BOOKING_DATA_FILE||'data/bookings.json');
export function editBooking(id,input,token,isAdmin,scope='single',ownerId=null){return transaction(all=>{
 const original=all.find(b=>b.id===id);
 if(!original)throw new Error('신청 내역을 찾을 수 없습니다.');
 if(!isAdmin&&(ownerId?original.ownerId!==ownerId:token!==original.manageToken))throw new Error('수정 권한이 없습니다.');
 if(!['approved','pending'].includes(original.status))throw new Error('취소된 예약은 수정할 수 없습니다.');
 if(!['single','future'].includes(scope))throw new Error('수정 범위를 확인해 주세요.');
 if(scope==='future'&&(!isAdmin||!original.seriesId))throw new Error('정기 일정 전체 수정은 담당자만 가능합니다.');
 const values=validate(input);
 const selected=scope==='future'?all.filter(b=>b.seriesId===original.seriesId&&b.date>=original.date&&['approved','pending'].includes(b.status)):[original];
 const delta=Date.parse(values.date)-Date.parse(original.date);
 const replacements=selected.map(b=>({...b,...validate({...values,date:new Date(Date.parse(b.date)+delta).toISOString().slice(0,10)}),updatedAt:new Date().toISOString()}));
 const ids=new Set(selected.map(b=>b.id));
 const others=all.filter(b=>!ids.has(b.id));
 if(replacements.some((b,i)=>others.some(other=>overlaps(b,other))||replacements.slice(0,i).some(other=>overlaps(b,other))))throw new Error('변경 일정이 다른 예약과 겹칩니다. 기존 예약은 그대로 유지됩니다.');
 for(const replacement of replacements)all[all.findIndex(b=>b.id===replacement.id)]=replacement;
 return replacements;
});}
const queueKey=Symbol.for('school-booking-write-queue');
globalThis[queueKey] ||= Promise.resolve();
export async function readBookings(){const db=await database();if(db)return (await readD1(db)).all;try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
async function transaction(fn){const db=await database();if(db)return mutateD1(db,fn);const task=globalThis[queueKey].then(async()=>{const all=await readBookings();const result=fn(all);await mkdir(path.dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(all,null,2));await rename(file+'.tmp',file);return result;});globalThis[queueKey]=task.catch(()=>{});return task;}
export function createBooking(input,ownerId=null){return transaction(all=>{const record=validate(input);if(all.some(b=>overlaps(record,b)))throw new Error('이미 예약된 시간입니다. 다른 시간을 선택해 주세요.');const b={...record,ownerId,id:randomUUID(),manageToken:randomUUID(),status:'approved',createdAt:new Date().toISOString()};all.push(b);return b;});}
export function createRecurring(input){return transaction(all=>{const year=Number(input.year),quarter=Number(input.quarter);if(!Number.isInteger(year)||year<2020||year>2100||![1,2,3,4].includes(quarter)||!Array.isArray(input.weekdays)||!input.weekdays.length||input.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('쿼터와 반복 요일을 확인해 주세요.');const dates=[];const start=new Date(Date.UTC(year,(quarter-1)*3,1)),end=new Date(Date.UTC(year,quarter*3,1));for(let d=start;d<end;d.setUTCDate(d.getUTCDate()+1))if(input.weekdays.includes(d.getUTCDay()))dates.push(d.toISOString().slice(0,10));const records=dates.map(date=>validate({...input,date}));const conflicts=records.filter(r=>all.some(b=>overlaps(r,b)));if(conflicts.length)throw new Error(`기존 예약과 겹치는 날짜: ${conflicts.map(r=>r.date).join(', ')}. 정기 예약은 등록되지 않았습니다.`);const seriesId=randomUUID();const created=records.map(r=>({...r,id:randomUUID(),manageToken:randomUUID(),seriesId,status:'approved',createdAt:new Date().toISOString()}));all.push(...created);return created;});}
export function updateBooking(id,status,token,isAdmin,ownerId=null){return transaction(all=>{const b=all.find(b=>b.id===id);if(!b)throw new Error('신청 내역을 찾을 수 없습니다.');if(!isAdmin&&((ownerId?b.ownerId!==ownerId:token!==b.manageToken)||status!=='cancelled'))throw new Error('변경 권한이 없습니다.');if(!['pending','approved'].includes(b.status))throw new Error('이미 처리된 신청입니다.');if(!['approved','rejected','cancelled'].includes(status))throw new Error('상태를 확인해 주세요.');if(status==='approved'&&all.some(other=>other.id!==id&&overlaps(b,other)))throw new Error('겹치는 예약이 있습니다.');b.status=status;b.updatedAt=new Date().toISOString();return b;});}
