import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export const supabaseConfigured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
export async function supabaseServer(){const jar=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll(){return jar.getAll();},setAll(items){for(const {name,value,options} of items)jar.set(name,value,options);}}});}

export async function googleAccount(){if(!supabaseConfigured())return null;try{const supabase=await supabaseServer();const {data:{user},error}=await supabase.auth.getUser();return !error&&user?.identities?.some(identity=>identity.provider==='google')?user:null;}catch{return null;}}
