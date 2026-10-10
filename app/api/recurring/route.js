import {isAdmin} from '../../../lib/admin.mjs';
import {createRecurring} from '../../../lib/store.mjs';
export const runtime='nodejs';
export async function POST(req){if(!isAdmin(req))return Response.json({error:'담당자 비밀번호를 확인해 주세요.'},{status:401});try{return Response.json(await createRecurring(await req.json()),{status:201});}catch(e){return Response.json({error:e.message},{status:400});}}
