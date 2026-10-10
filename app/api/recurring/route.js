import {googleAccount} from '../../../lib/supabase.mjs';
import {isAdmin} from '../../../lib/admin.mjs';
import {createRecurring} from '../../../lib/store.mjs';
export const runtime='nodejs';
export async function POST(req){if(!await googleAccount())return Response.json({error:'Google 로그인이 필요합니다.'},{status:401});if(!await isAdmin(req))return Response.json({error:'관리자 권한이 필요합니다.'},{status:401});try{return Response.json(await createRecurring(await req.json()),{status:201});}catch(e){return Response.json({error:e.message},{status:400});}}
