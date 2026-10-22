'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSite, Shell, LapGallery } from '../../lib/data';

const CG_CSS = `
.cg-form{max-width:460px;margin-top:22px}
.cg-form input{width:100%;background:#0b0b0b;color:#fff;border:1px solid var(--line);padding:16px;font:600 20px system-ui;letter-spacing:.35em;text-align:center;text-transform:uppercase;margin:0 0 14px;border-radius:0}
.cg-meta{font:13px system-ui;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);margin:6px 0 18px}
.cg-view{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.98);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:pan-y}
.cg-view img{max-width:100%;max-height:74vh;object-fit:contain;display:block}
.cg-count{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:20px;color:var(--mute);font:13px system-ui;letter-spacing:.15em}
.cg-x,.cg-n{position:absolute;background:rgba(255,255,255,.12);color:#fff;border:0;border-radius:50%;width:46px;height:46px;font-size:22px;cursor:pointer}
.cg-x{top:calc(12px + env(safe-area-inset-top,0px));right:14px}
.cg-n.l{left:8px;top:50%}.cg-n.r{right:8px;top:50%}
@media(max-width:600px){.cg-n{display:none}}
.cg-bar{margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:0 16px calc(10px + env(safe-area-inset-bottom,0px))}
.cg-prog{font:14px system-ui;color:var(--gold);margin:10px 0 0}
`;

const pad = (n) => String(n).padStart(3, '0');
const slugify = (s) => String(s || 'photos').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'photos';

async function toFile(url, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('fetch failed');
  const blob = await res.blob();
  const ext = ((blob.type || 'image/jpeg').split('/')[1] || 'jpg').replace('jpeg', 'jpg').split('+')[0];
  return new File([blob], `${name}.${ext}`, { type: blob.type || 'image/jpeg' });
}

function saveFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export default function ClientGallery() {
  const d = useSite([]);
  const [code, setCode] = useState('');
  const [g, setG] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState(null);
  const [prog, setProg] = useState('');
  const sx = useRef(0);

  const photos = (g && Array.isArray(g.photos) ? g.photos : []);
  const base = slugify(g && g.title);

  async function lookup(k) {
    try {
      const { data, error } = await supabase.functions.invoke('r2', { body: { action: 'gallery', code: k } });
      if (!error && data && data.title) return data;
    } catch (e) {}
    const res = await supabase.rpc('get_client_gallery', { p_code: k });
    return res.error ? null : res.data;
  }

  async function openGallery(raw) {
    const k = String(raw || '').replace(/[^A-Za-z0-9]/g, '');
    if (k.length < 4) { setErr('Please enter your gallery code.'); return; }
    setBusy(true);
    setErr('');
    let data = await lookup(k);
    if (!data && k.length > 8) data = await lookup(k.slice(0, 8));
    setBusy(false);
    if (!data) { setErr('We could not find that gallery. Please check your code, or contact us and we will help.'); return; }
    setG(data);
  }

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    const q = new URLSearchParams(window.location.search).get('c');
    if (q) { setCode(q.toUpperCase().slice(0, 8)); openGallery(q); }
    return () => m.remove();
  }, []);

  useEffect(() => {
    document.body.style.overflow = view !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [view]);

  useEffect(() => {
    if (view === null) return;
    const n = photos.length;
    const k = (e) => {
      if (e.key === 'Escape') setView(null);
      if (e.key === 'ArrowRight') setView((v) => (v + 1) % n);
      if (e.key === 'ArrowLeft') setView((v) => (v - 1 + n) % n);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [view, photos.length]);

  async function saveOne(i) {
    const p = photos[i];
    try {
      const file = await toFile(p.f, `${base}-${pad(i + 1)}`);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      saveFile(file);
    } catch (e) {
      window.open(p.f, '_blank');
    }
  }

  async function saveAll() {
    if (!window.confirm(`Download all ${photos.length} photos? Your phone may ask you to allow multiple downloads.`)) return;
    let failed = 0;
    for (let i = 0; i < photos.length; i++) {
      setProg(`Downloading ${i + 1} of ${photos.length}…`);
      try { saveFile(await toFile(photos[i].f, `${base}-${pad(i + 1)}`)); } catch (e) { failed++; }
      await new Promise((r) => setTimeout(r, 700));
    }
    setProg(failed ? `${failed} photo(s) could not be saved. Tap a photo and use Download.` : 'Done. Check your Downloads or Photos.');
    setTimeout(() => setProg(''), 8000);
  }

  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const go = (dir) => setView((v) => (v + dir + photos.length) % photos.length);
  const allow = g ? g.allow_download !== false : false;

  return (
    <Shell c={c}>
      <style>{CG_CSS}</style>
      <div className="wrap pg">
        {!g ? (
          <div style={{ maxWidth: 520 }}>
            <p className="lbl">// Private gallery</p>
            <h1>Your photos</h1>
            <p className="mute">Enter the code we sent you to view and download your photos.</p>
            <form className="cg-form" onSubmit={(e) => { e.preventDefault(); openGallery(code); }}>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={12}
                autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="Gallery code" />
              <button className="btn" disabled={busy}>{busy ? 'Opening…' : 'Open gallery'}</button>
              {err && <p className="err">{err}</p>}
            </form>
          </div>
        ) : (
          <>
            <p className="lbl">// Your photos</p>
            <h1>{g.title}</h1>
            {g.message && <p className="mute" style={{ whiteSpace: 'pre-line', maxWidth: 640 }}>{g.message}</p>}
            <p className="cg-meta">
              {photos.length} photo{photos.length === 1 ? '' : 's'}
              {g.expires_on ? ` · available until ${g.expires_on}` : ''}
              {!allow ? ' · view only' : ''}
            </p>
            {allow && photos.length > 0 && <button className="btn" onClick={saveAll}>Download all</button>}
            {prog && <p className="cg-prog">{prog}</p>}
            {photos.length === 0 && <p className="mute">Your photos are being prepared. Please check back soon.</p>}

            {photos.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <LapGallery photos={photos.map((p) => ({ url: p.f, thumb: p.t || p.f }))} onOpen={(i) => setView(i)} label="Photo" />
              </div>
            )}
          </>
        )}
      </div>

      {g && view !== null && photos[view] && (
        <div className="cg-view" role="dialog" aria-label="Photo viewer"
          onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
          <span className="cg-count">{view + 1} / {photos.length}</span>
          <button className="cg-x" aria-label="Close photo" onClick={() => setView(null)}>✕</button>
          {photos.length > 1 && <button className="cg-n l" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>}
          <img src={photos[view].f} alt="" />
          {photos.length > 1 && <button className="cg-n r" aria-label="Next photo" onClick={() => go(1)}>›</button>}
          {allow && (
            <div className="cg-bar">
              <button className="btn" onClick={() => saveOne(view)}>Download</button>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
