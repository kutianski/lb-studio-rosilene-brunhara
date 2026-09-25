import {PublicPage} from '@/components/site';
import {getContent} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Page(){return <PublicPage page="contact" data={await getContent()}/>}
