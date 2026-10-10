import {googleAccount} from '../../../lib/supabase.mjs';
import {isAdmin} from '../../../lib/admin.mjs';
export async function GET(req){if(!await googleAccount())return Response.json({error:'Google 로그인이 필요합니다.'},{status:401});return Response.json({ok:isAdmin(req)},{status:isAdmin(req)?200:401});}
