import {isAdmin} from '../../../lib/admin.mjs';
export async function GET(req){return Response.json({ok:isAdmin(req)},{status:isAdmin(req)?200:401});}
