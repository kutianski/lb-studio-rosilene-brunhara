import {administrator,getContent} from '@/lib/server';
import Admin from '@/components/admin';
export const dynamic='force-dynamic';
export const metadata={title:'Administração · LB studio',robots:{index:false,follow:false}};
export default async function AdminPage(){const admin=await administrator();return <Admin initial={await getContent(true)} email={admin.email}/>}
