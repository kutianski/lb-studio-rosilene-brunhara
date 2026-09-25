import {getContent,json,failure} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){try{return json(await getContent())}catch(e){return failure(e)}}
