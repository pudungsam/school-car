import {isAdmin} from '../../../lib/admin.mjs';
import {readBookings,createBooking,updateBooking,editBooking} from '../../../lib/store.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function admin(req){return isAdmin(req);}
export async function GET(req){try{const all=await readBookings();const full=admin(req);const tokens=JSON.parse(req.headers.get('x-booking-tokens')||'[]');if(!Array.isArray(tokens))return Response.json({error:'조회 권한을 확인해 주세요.'},{status:400});return Response.json(all.map(b=>full||tokens.includes(b.manageToken)?b:{id:b.id,vehicleId:b.vehicleId,date:b.date,start:b.start,end:b.end,status:b.status}));}catch{return Response.json({error:'저장된 내역을 불러올 수 없습니다.'},{status:500});}}
export async function POST(req){try{const b=await createBooking(await req.json());return Response.json(b,{status:201});}catch(e){return Response.json({error:e.message},{status:400});}}
export async function PATCH(req){try{const {id,status,manageToken,changes,scope}=await req.json();const b=changes?await editBooking(id,changes,manageToken,admin(req),scope):await updateBooking(id,status,manageToken,admin(req));return Response.json(b);}catch(e){return Response.json({error:e.message},{status:400});}}
