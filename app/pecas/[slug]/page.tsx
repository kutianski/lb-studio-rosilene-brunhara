import {DetailPage} from '@/components/site';
import {getContent} from '@/lib/server';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:any){const {slug}=await params;const data=await getContent();const e=data.entries.find(e=>e.kind==='product'&&e.slug===slug);return {title:e?`${e.name} · ${data.settings.brand}`:'Peça não encontrada',description:e?.description.slice(0,160)}}
export default async function Page({params}:any){const {slug}=await params;const data=await getContent();const entry=data.entries.find(e=>e.kind==='product'&&e.slug===slug);if(!entry)notFound();return <DetailPage entry={entry} data={data}/>}
