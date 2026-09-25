import {Skeleton} from '@/components/ui/skeleton';
export default function Loading(){return <main className="wrap" aria-busy="true" aria-label="Carregando conteúdo"><p className="eyebrow" style={{marginTop:50}}>LB studio</p><Skeleton className="h-16 w-2/3 mb-6"/><Skeleton className="h-48 w-full"/><p className="muted mt-6">Carregando…</p></main>}
