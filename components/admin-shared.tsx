'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowLeft, ArrowRight, Trash2, ImagePlus } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
export async function api(path, data, method) { let response; try {
    response = await fetch('/api/admin/' + path, { method: method || (data ? 'POST' : 'GET'), headers: data ? { 'Content-Type': 'application/json' } : undefined, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' });
}
catch {
    throw new Error('Sem conexão. Seus dados continuam no formulário. Tente novamente.');
} let result; try {
    result = await response.json();
}
catch {
    throw new Error('O servidor não respondeu como esperado. Tente novamente.');
} if (!response.ok)
    throw new Error(result.error || 'Não foi possível concluir.'); return result; }
export function Field({ label, value, onChange, type = 'text', multiline = false, hint, required = false, ...props }) { return _jsxs("label", { className: "field", children: [_jsxs("span", { children: [label, required ? ' *' : ''] }), multiline ? _jsx("textarea", { value: value, onChange: e => onChange(e.target.value), rows: 5, required: required, ...props }) : _jsx("input", { type: type, value: value, onChange: e => onChange(e.target.value), required: required, ...props }), " ", hint && _jsx("small", { children: hint })] }); }
export function Choice({ label, value, onChange, options }) { return _jsxs("div", { className: "field", children: [_jsx("span", { children: label }), _jsxs(Select, { value: value || '__none', onValueChange: v => onChange(v === '__none' ? '' : v), children: [_jsx(SelectTrigger, { "aria-label": label, className: "admin-select", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Object.entries(options).map(([k, v]) => _jsx(SelectItem, { value: k || '__none', children: v }, k || '__none')) })] })] }); }
export function Toggle({ label, value, onChange }) { return _jsxs("label", { className: "toggle", children: [_jsx(Switch, { checked: value, onCheckedChange: onChange, "aria-label": label }), _jsx("span", { children: label })] }); }
export function useConfirm() { const [request, setRequest] = useState(null); function confirm(title, description = 'Esta ação não pode ser desfeita.') { return new Promise(resolve => setRequest({ title, description, resolve })); } const node = _jsx(AlertDialog, { open: !!request, onOpenChange: open => { if (!open) {
        request?.resolve(false);
        setRequest(null);
    } }, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: request?.title }), _jsx(AlertDialogDescription, { children: request?.description })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { onClick: () => { request?.resolve(false); setRequest(null); }, children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: () => { request?.resolve(true); setRequest(null); }, children: "Confirmar" })] })] }) }); return { confirm, node }; }
export function move(items, from, to) { if (to < 0 || to >= items.length)
    return items; const next = [...items]; [next[from], next[to]] = [next[to], next[from]]; return next; }
export function PhotoEditor({ photos, onChange, label = 'Fotografias' }) {
    const [progress, setProgress] = useState(null), [error, setError] = useState(''), [library, setLibrary] = useState(null), [loading, setLoading] = useState(false);
    const current = useRef(photos);
    useEffect(() => { current.current = photos; }, [photos]);
    const input = useRef(null);
    const [replacing, setReplacing] = useState(null);
    async function upload(files) { if (!files?.length)
        return; setError(''); let next = [...current.current]; const accepted = Array.from(files); setProgress(0); try {
        for (let i = 0; i < accepted.length; i++) {
            const f = accepted[i];
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
                throw new Error(`${f.name}: formato inválido. Use JPG, JPEG, PNG ou WebP.`);
            if (f.size > 10 * 1024 * 1024)
                throw new Error(`${f.name}: o limite é 10 MB por fotografia.`);
            try {
                const bitmap = await createImageBitmap(f);
                bitmap.close();
            }
            catch {
                throw new Error(`${f.name}: a imagem não pôde ser lida. Escolha outra fotografia.`);
            }
            const p = await new Promise((resolve, reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST', '/api/admin/upload'); xhr.upload.onprogress = e => { if (e.lengthComputable)
                setProgress(Math.round((i + e.loaded / e.total) / accepted.length * 100)); }; xhr.onload = () => { let result; try {
                result = JSON.parse(xhr.responseText);
            }
            catch {
                return reject(new Error(xhr.status === 413 ? 'A fotografia excede o limite de envio. Use um arquivo de até 10 MB.' : 'Falha no envio. Tente novamente.'));
            } if (xhr.status >= 200 && xhr.status < 300)
                resolve(result);
            else
                reject(new Error(result.error || 'Falha no envio.')); }; xhr.onerror = () => reject(new Error('Sem conexão durante o envio. As fotos já enviadas foram preservadas.')); xhr.ontimeout = () => reject(new Error('O envio demorou mais que o esperado. Tente novamente.')); xhr.timeout = 90000; const form = new FormData(); form.append('file', f); xhr.send(form); });
            p.alt = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
            if (replacing !== null && i === 0)
                next = next.map((old, index) => index === replacing ? p : old);
            else
                next.push(p);
            current.current = next;
            onChange(next);
        }
        toast.success('Fotografias enviadas. Salve o conteúdo para publicá-las.');
    }
    catch (e) {
        setError(e.message);
        toast.error(e.message);
    }
    finally {
        setProgress(null);
        setReplacing(null);
        if (input.current)
            input.current.value = '';
    } }
    function update(index, changes) { onChange(photos.map((p, i) => i === index ? { ...p, ...changes } : p)); }
    return _jsxs("div", { className: "photo-editor", children: [_jsxs("div", { className: "subheading", children: [_jsx("h3", { children: label }), _jsxs("span", { children: [photos.length, " ", photos.length === 1 ? 'imagem' : 'imagens'] })] }), _jsx("p", { className: "help", children: "JPG, JPEG, PNG ou WebP · até 10 MB por foto. A primeira imagem é a capa. As fotografias mantêm sua qualidade original." }), _jsxs("div", { className: "photo-actions", children: [_jsxs("label", { className: "btn outline upload-label", children: [_jsx(Upload, { size: 17 }), progress !== null ? 'Enviando…' : 'Enviar fotografias', _jsx("input", { "aria-label": `Enviar ${label.toLowerCase()}`, ref: input, type: "file", accept: "image/jpeg,image/png,image/webp", multiple: replacing === null, disabled: progress !== null, onChange: e => upload(e.target.files) })] }), _jsxs("button", { type: "button", className: "btn outline", disabled: loading, onClick: async () => { setLoading(true); try {
                            setLibrary(await api('media'));
                        }
                        catch (e) {
                            toast.error(e.message);
                        }
                        finally {
                            setLoading(false);
                        } }, children: [_jsx(ImagePlus, { size: 17 }), "Usar foto já enviada"] })] }), progress !== null && _jsxs("div", { role: "status", children: [_jsx(Progress, { value: progress }), _jsxs("p", { className: "help", children: ["Enviando fotografias: ", progress, "%"] })] }), error && _jsx("p", { className: "form-error", role: "alert", children: error }), _jsx("div", { className: "admin-photos", children: photos.map((p, i) => _jsxs("div", { className: "admin-photo", children: [_jsx("img", { src: p.url, alt: p.alt || `Fotografia ${i + 1}`, style: { objectFit: p.fit, objectPosition: `${p.x}% ${p.y}%` } }), _jsx("span", { className: "photo-number", children: i === 0 ? 'Capa' : `Foto ${i + 1}` }), _jsxs("div", { className: "row-actions", children: [_jsx("button", { type: "button", title: "Mover fotografia para a esquerda", "aria-label": `Mover fotografia ${i + 1} para a esquerda`, disabled: !i || progress !== null, onClick: () => onChange(move(photos, i, i - 1)), children: _jsx(ArrowLeft, { size: 17 }) }), _jsx("button", { type: "button", title: "Mover fotografia para a direita", "aria-label": `Mover fotografia ${i + 1} para a direita`, disabled: i === photos.length - 1 || progress !== null, onClick: () => onChange(move(photos, i, i + 1)), children: _jsx(ArrowRight, { size: 17 }) }), _jsx("button", { type: "button", "aria-label": `Remover fotografia ${i + 1}`, disabled: progress !== null, onClick: () => onChange(photos.filter((_, j) => j !== i)), children: _jsx(Trash2, { size: 17 }) })] }), _jsx("button", { type: "button", className: "text-link", disabled: progress !== null, onClick: () => { setReplacing(i); setTimeout(() => input.current?.click(), 0); }, children: "Substituir foto" }), _jsx(Field, { label: `Descrição da foto ${i + 1}`, value: p.alt, onChange: v => update(i, { alt: v }) }), _jsx(Choice, { label: `Enquadramento da foto ${i + 1}`, value: p.fit, onChange: v => update(i, { fit: v }), options: { contain: 'Foto inteira (sem corte)', cover: 'Preencher espaço' } }), p.fit === 'cover' && _jsxs("div", { className: "form-grid", children: [_jsx(Field, { label: "Posição horizontal (%)", type: "number", min: "0", max: "100", value: String(p.x), onChange: v => update(i, { x: Math.min(100, Math.max(0, Number(v))) }) }), _jsx(Field, { label: "Posição vertical (%)", type: "number", min: "0", max: "100", value: String(p.y), onChange: v => update(i, { y: Math.min(100, Math.max(0, Number(v))) }) })] })] }, p.id + '-' + i)) }), _jsx(Dialog, { open: library !== null, onOpenChange: open => { if (!open)
                    setLibrary(null); }, children: _jsxs(DialogContent, { className: "sm:max-w-[850px] max-h-[85vh] overflow-y-auto", children: [_jsx(DialogTitle, { children: "Suas fotografias" }), _jsx(DialogDescription, { children: "Selecione uma fotografia já enviada para adicioná-la ao conteúdo." }), !library?.length && _jsx("p", { children: "Nenhuma fotografia enviada ainda." }), _jsx("div", { className: "media-picker", children: library?.map(m => _jsxs("button", { type: "button", disabled: photos.some(p => p.id === m.id), onClick: () => { onChange([...photos, { id: m.id, url: `/api/media/${m.id}`, alt: m.name, fit: 'contain', x: 50, y: 50 }]); setLibrary(null); }, children: [_jsx("img", { src: `/api/media/${m.id}`, alt: m.name }), _jsx("span", { children: m.name })] }, m.id)) })] }) })] });
}
export function PreviewDialog({ data, entry, page = 'home', open, onClose }) { const [width, setWidth] = useState('390'); const frame = useRef(null); function send() { frame.current?.contentWindow?.postMessage({ type: 'lb-preview', data, entry, page }, window.location.origin); } useEffect(() => { if (!open)
    return; const ready = (e) => { if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === 'lb-preview-ready')
    send(); }; window.addEventListener('message', ready); send(); return () => window.removeEventListener('message', ready); }, [data, entry, page, open]); return _jsx(Dialog, { open: open, onOpenChange: v => { if (!v)
        onClose(); }, children: _jsxs(DialogContent, { className: "sm:max-w-[96vw] max-w-[96vw] h-[94vh] flex flex-col", children: [_jsx(DialogTitle, { children: "Prévia — alterações ainda não publicadas" }), _jsx(DialogDescription, { children: "Confira o conteúdo antes de salvar. A prévia usa o mesmo visual do site." }), _jsx(Choice, { label: "Largura da prévia", value: width, onChange: setWidth, options: { '360': 'Celular · 360 px', '390': 'Celular · 390 px', '768': 'Tablet · 768 px', '1024': 'Computador · 1024 px', '1440': 'Computador · 1440 px' } }), _jsx("div", { className: "preview-scroll", children: _jsx("iframe", { ref: frame, title: "Prévia do site", src: "/admin/prever", onLoad: send, style: { width: Number(width), height: '100%', minHeight: 450, border: 0, background: '#f8f5ef' } }) })] }) }); }
