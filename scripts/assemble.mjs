import fs from 'node:fs';
import path from 'node:path';
const read=(parts)=>parts.map(p=>fs.readFileSync(p,'utf8')).join('');
const writeB64=(parts,out)=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(read(parts),'base64'))};
const admin=Array.from({length:5},(_,i)=>`encoded/admin.${String(i).padStart(2,'0')}.b64`);
const globals=Array.from({length:3},(_,i)=>`encoded/globals.${String(i).padStart(2,'0')}.b64`);
writeB64(admin,'components/admin.tsx');
writeB64(globals,'app/globals.css');
