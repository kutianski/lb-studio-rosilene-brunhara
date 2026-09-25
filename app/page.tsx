import {PublicPage} from '@/components/site';
import {getContent} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Home(){return <PublicPage page="home" data={await getContent()}/>}
