import {defaults,Content,Settings} from './model';

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL||'https://ngrgfsczokaolrvwzyoe.supabase.co';
const SUPABASE_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.SUPABASE_ANON_KEY||'sb_publishable_q6aFKvZrAeSKeNM3RFA0Xg_HMiiJ-6k';
const BUCKET='lb-studio-media';

function configured(){return Boolean(SUPABASE_URL&&SUPABASE_KEY)}
function headers(extra:HeadersInit={}):HeadersInit{return {apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json',...extra}}
async function rest(path:string,init:RequestInit={}){
  if(!configured())throw new Error('O conteúdo está temporariamente indisponível. Tente novamente.');
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:headers(init.headers||{}),cache:'no-store'});
  if(!res.ok){const t=await res.text();throw new Error(`Supabase ${res.status}: ${t}`)}
  if(res.status===204)return null;
  const text=await res.text();return text?JSON.parse(text):null;
}
export async function getSettings():Promise<Settings>{
  const rows=await rest('lb_settings?id=eq.site&select=data,revision');
  const row=rows?.[0];
  return row?{...(row.data||{}),revision:row.revision}:structuredClone(defaults);
}
export async function getContent(admin=false):Promise<Content>{
  const entryQuery=admin?'lb_entries?select=data,revision,category_id,sort,status,hidden&order=sort.asc':'lb_entries?status=eq.published&hidden=eq.false&select=data,revision,category_id,sort,status,hidden&order=sort.asc';
  const [settings,categories,entries]=await Promise.all([
    getSettings(),
    rest('lb_categories?select=id,name,sort&order=sort.asc,name.asc'),
    rest(entryQuery),
  ]);
  return {
    settings:admin?settings:{...settings,sections:settings.sections.filter(s=>s.visible),nav:settings.nav.filter(n=>n.visible)},
    categories:(categories||[]).map((c:any)=>({id:c.id,name:c.name,order:c.sort})),
    entries:(entries||[]).map((row:any)=>({...row.data,revision:row.revision,categoryId:row.category_id||'',order:row.sort,status:row.status,hidden:!!row.hidden}))
  }
}
export async function administrator(){
  const email=(process.env.ADMIN_EMAIL||'admin@lb-studio.local').trim().toLowerCase();
  return {userId:'direct-admin',displayName:'Administrador',email,fullName:'Administrador'};
}
export class ApiError extends Error {constructor(message:string,public status=400){super(message)}}
export async function requireAdmin(request:Request,mutation=false){
  const user=await administrator();
  if(mutation){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new ApiError('Não foi possível verificar a origem. Atualize a página e tente novamente.',403)}
  return user;
}
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function failure(e:unknown){if(e instanceof ApiError)return json({error:e.message},e.status);console.error('LB studio operation failed',e);if(String(e).includes('duplicate key')||String(e).includes('23505'))return json({error:'Este endereço já está em uso. Escolha outro endereço para o item.'},409);return json({error:'Não foi possível concluir. Seus dados continuam no formulário. Tente novamente.'},503)}
export {rest,headers,SUPABASE_URL,SUPABASE_KEY,BUCKET};
