import type {Metadata} from 'next';
import './globals.css';
import {getSettings} from '@/lib/server';
export async function generateMetadata():Promise<Metadata>{try{const s=await getSettings();return {title:`${s.brand} · ${s.creator}`,description:`Cerâmicas, história e aulas de ${s.creator}. Conheça a ${s.brand}.`,icons:{icon:s.favicon[0]?.url||'/favicon.svg'}}}catch{return {title:'LB studio · Rosilene Brunhara',icons:{icon:'/favicon.svg'}}}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
