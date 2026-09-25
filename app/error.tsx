'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><p className="eyebrow">LB studio</p><h1>Vamos tentar novamente?</h1><p>O conteúdo está temporariamente indisponível. Aguarde um momento e tente de novo.</p><button className="btn" onClick={reset}>Tentar novamente</button></main>}
