import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
test('edits enforce ownership and preserve original on conflict; series updates are atomic',async()=>{
 const dir=await mkdtemp(path.join(process.cwd(),'.test-edit-'));process.env.BOOKING_DATA_FILE=path.join(dir,'bookings.json');
 const {createBooking,createRecurring,editBooking,readBookings,updateBooking}=await import('../lib/store.mjs');
 const input={vehicleId:'bus',date:'2026-10-05',start:'09:00',end:'10:00',applicant:'테스트',purpose:'출장',destination:'교육청',passengers:2};
 try{
 const b=await createBooking(input);await assert.rejects(editBooking(b.id,input,'wrong',false));
 const [edited]=await editBooking(b.id,{...input,start:'10:00',end:'11:00'},b.manageToken,false);assert.equal(edited.id,b.id);assert.equal(edited.manageToken,b.manageToken);
 await createBooking({...input,start:'11:00',end:'12:00'});
 const before=await readBookings();await assert.rejects(editBooking(b.id,{...input,start:'11:30',end:'12:30'},b.manageToken,false));assert.deepEqual(await readBookings(),before);
 const series=await createRecurring({...input,vehicleId:'car',year:2026,quarter:4,weekdays:[1]});
 await assert.rejects(editBooking(series[1].id,{...input,vehicleId:'car'},series[1].manageToken,false,'future'));
 await updateBooking(series[2].id,'cancelled',series[2].manageToken,false);
 await createBooking({...input,vehicleId:'van',date:series[5].date,start:'13:00',end:'14:00'});
 const snapshot=await readBookings();await assert.rejects(editBooking(series[1].id,{...input,vehicleId:'van',date:series[1].date,start:'13:00',end:'14:00'},null,true,'future'));assert.deepEqual(await readBookings(),snapshot);
 const result=await editBooking(series[1].id,{...input,vehicleId:'car',date:series[1].date,start:'15:00',end:'16:00'},null,true,'future');assert.equal(result.length,11);
 const all=await readBookings();assert.equal(all.find(b=>b.id===series[0].id).start,'09:00');assert.equal(all.find(b=>b.id===series[2].id).status,'cancelled');
 const [single]=await editBooking(series[1].id,{...input,vehicleId:'car',date:'2026-10-13',start:'17:00',end:'18:00'},null,true);assert.equal(single.date,'2026-10-13');assert.equal((await readBookings()).find(b=>b.id===series[3].id).start,'15:00');
 }finally{await rm(dir,{recursive:true,force:true});}
});
