import {administrator} from '@/lib/server';
import PreviewReceiver from '@/components/preview-receiver';
export const dynamic='force-dynamic';
export default async function Page(){if(!await administrator())return <p>Acesso restrito.</p>;return <PreviewReceiver/>}
