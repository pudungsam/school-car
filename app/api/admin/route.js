import {googleAccount} from '../../../lib/supabase.mjs';
import {adminRole,listAdmins,changeAdmin,developerEmail} from '../../../lib/admin.mjs';
export const dynamic='force-dynamic';
export async function GET(){const user=await googleAccount();if(!user)return Response.json({error:'Google 로그인이 필요합니다.'},{status:401});const role=await adminRole(user);return Response.json({role,developerEmail:role==='developer'?developerEmail():undefined,administrators:['admin','developer'].includes(role)?await listAdmins():[]},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req){const user=await googleAccount();if(!user)return Response.json({error:'Google 로그인이 필요합니다.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'허용되지 않은 요청입니다.'},{status:403});try{await changeAdmin(user,await req.json());return Response.json({ok:true});}catch(e){return Response.json({error:e.message},{status:403});}}
