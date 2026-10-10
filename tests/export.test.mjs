import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookingsCsv} from '../lib/export.mjs';
test('CSV preserves Korean, commas, quotes and multiline notes while neutralizing formulas',()=>{const csv=bookingsCsv([{date:'2026-10-10',vehicleId:'bus',applicant:'=1+1',destination:'서울, 교육청',purpose:'"출장"',start:'09:00',end:'10:00',passengers:2,notes:'첫째\n둘째',status:'cancelled',manageToken:'secret'}]);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'=1+1"'));assert.ok(csv.includes('"서울, 교육청"'));assert.ok(csv.includes('"""출장"""'));assert.ok(csv.includes('"첫째\n둘째"'));assert.ok(csv.includes('"취소됨"'));assert.ok(!csv.includes('secret'));assert.ok(bookingsCsv([]).includes('신청자'));});
