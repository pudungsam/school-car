import {NextResponse} from 'next/server';
import {supabaseConfigured,supabaseServer} from '../../../../lib/supabase.mjs';
export const runtime='nodejs';
export async function GET(req){if(!supabaseConfigured())return Response.json({error:'Supabase 로그인 연결 설정이 필요합니다.'},{status:503});try{const supabase=await supabaseServer();const origin=process.env.AUTH_URL||new URL(req.url).origin;const {data,error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/api/auth/callback',origin).href,skipBrowserRedirect:true}});if(error||!data.url)throw error;return NextResponse.redirect(data.url);}catch{return NextResponse.redirect(new URL('/?authError=1',process.env.AUTH_URL||req.url));}}
