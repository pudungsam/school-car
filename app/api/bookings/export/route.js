import {googleAccount} from '../../../../lib/supabase.mjs';
import {isAdmin} from '../../../../lib/admin.mjs';
import {readBookings} from '../../../../lib/store.mjs';
import {bookingsCsv} from '../../../../lib/export.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req){if(!await googleAccount())return Response.json({error:'Google 로그인이 필요합니다.'},{status:401});if(!isAdmin(req))return Response.json({error:'담당자 권한이 필요합니다.'},{status:401});try{return new Response(bookingsCsv(await readBookings()),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="school-vehicle-bookings.csv"','Cache-Control':'no-store'}});}catch{return Response.json({error:'신청 내역을 다운로드하지 못했습니다.'},{status:500});}}
