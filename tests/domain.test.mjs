import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate,overlaps} from '../lib/domain.mjs';
const input={vehicleId:'car',date:'2026-10-12',start:'09:00',end:'10:00',applicant:'홍길동',department:'행정실',phone:'010-0000-0000',purpose:'출장',destination:'교육청',passengers:2};
test('start and return times use ten minute intervals',()=>{for(const end of ['10:00','10:10','10:20','10:30','10:40','10:50','22:00'])assert.equal(validate({...input,start:'09:10',end}).end,end);for(const start of ['09:01','09:05','09:59'])assert.throws(()=>validate({...input,start}),/10분/);for(const end of ['10:01','10:05','10:59'])assert.throws(()=>validate({...input,end}),/10분/);});
test('overlap blocks a confirmed or regular booking; adjacent bookings are allowed',()=>{assert.equal(overlaps(input,{...input,status:'approved',start:'09:30',end:'11:00'}),true);assert.equal(overlaps(input,{...input,status:'approved',start:'10:00',end:'11:00'}),false);assert.equal(overlaps(input,{...input,status:'cancelled'}),false);assert.equal(overlaps(input,{...input,vehicleId:'bus',status:'approved'}),false);});
test('capacity and invalid times and dates are rejected',()=>{assert.equal(validate(input).passengers,2);assert.throws(()=>validate({...input,passengers:26}));assert.throws(()=>validate({...input,start:'10:00'}));assert.throws(()=>validate({...input,date:'2026-02-30'}));});


