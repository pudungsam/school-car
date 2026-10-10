import {NextResponse} from 'next/server';
import {supabaseConfigured,supabaseServer} from '../../../../lib/supabase.mjs';
export const runtime='nodejs';
export async function GET(req){const origin=process.env.AUTH_URL||new URL(req.url).origin;const fail=()=>NextResponse.redirect(new URL('/?authError=1',origin));if(!supabaseConfigured())return fail();const code=new URL(req.url).searchParams.get('code');if(!code)return fail();try{const supabase=await supabaseServer();const {error}=await supabase.auth.exchangeCodeForSession(code);if(error)return fail();return NextResponse.redirect(new URL('/',origin));}catch{return fail();}}
