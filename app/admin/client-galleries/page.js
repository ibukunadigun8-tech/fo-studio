'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import '../../site.css';

const BUCKET = 'site-media';
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const makeCode = () => {
  const a = new Uint32Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (v) => ALPHA[v % ALPHA.length]).join('');
};
const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
const pub = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const digits = (s) => String(s || '').replace(/\D/g, '');

async function resize(file, max, q) {
  try {
    const bmp = await createImageBitmap(file);
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * r);
    cv.height = Math.round(bmp.height * r);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', q));
    return blob || file;
  } catch (e) { return file; }
}

const CSS = `
.cgt{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}
.cgt div{position:relative}
.cgt img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.cgt button{position:absolute;top:3px;right:3px;background:rgba(0,0,0,.75);color:#fff;border:0;width:30px;height:30px;font-size:18px;cursor:pointer;border-radius:50%}
.cgs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.cgs .btn{padding:10px 14px;font-size:11px}
.cglink{word-break:break-all;font:13px system-ui;color:var(--gold);margin:6px 0}
`;

export default function ClientGalleriesAdmin() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [quality, setQuality] = useState('high');
  const [newT, setNewT] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('client_galleries').select('*').order('created_at', { ascending: false });
    if (error) setErr('Could not load galleries: ' + error.message + '. Run the latest SQL in Supabase first.');
    else { setErr(''); setRows(data || []); }
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) load(); });
  }, []);

  if (session === undefined) return <div className="load">…</div>;
  if (!session) return <div className="adm"><h2>Please log in first</h2><a className="btn" href="/admin">Go to admin login</a></div>;

  const set = (id, k, v) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const link = (r) => `${window.location.origin}/gallery?c=${r.code}`;
  const shareText = (r) => `Hello! Your photos are ready.\n\nOpen your private gallery: ${link(r)}\n\nYour code: ${r.code}`;

  async function create() {
    if (!newT.trim()) return alert('Type a gallery title first, for example: Anne and Tunde Wedding.');
    const { data, error } = await supabase.from('client_galleries').insert({ title: newT.trim(), code: makeCode() }).select().single();
    if (error) return alert(error.message);
    setNewT('');
    await load();
    setOpen(data.id);
  }

  async function save(r) {
    const patch = {
      title: r.title,
      client_phone: r.client_phone || null,
      code: String(r.code || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
      message: r.message || null,
      allow_download: !!r.allow_download,
      expires_on: r.expires_on || null,
      is_active: !!r.is_active,
    };
    if (patch.code.length < 6) return alert('The code must be at least 6 letters or numbers.');
    const { error } = await supabase.from('client_galleries').update(patch).eq('id', r.id);
    alert(error ? error.message : 'Saved');
    load();
  }

  async function copyLink(r) {
    try { await navigator.clipboard.writeText(shareText(r)); alert('Copied. Paste it into WhatsApp or SMS.'); }
    catch (e) { window.prompt('Copy this message:', shareText(r)); }
  }

  async function addPhotos(r, files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    let photos = Array.isArray(r.photos) ? [...r.photos] : [];
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setMsg(`Uploading ${i + 1} of ${list.length}…`);
      const id = rid();
      const thumb = await resize(f, 900, 0.8);
      const full = quality === 'original' ? f : await resize(f, 3000, 0.9);
      const ext = quality === 'original' ? ((f.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg') : 'jpg';
      const tp = `clients/${r.id}/${id}-t.jpg`;
      const fp = `clients/${r.id}/${id}-f.${ext}`;
      const u1 = await supabase.storage.from(BUCKET).upload(tp, thumb, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (u1.error) { alert(u1.error.message); continue; }
      const u2 = await supabase.storage.from(BUCKET).upload(fp, full, { contentType: quality === 'original' ? (f.type || 'image/jpeg') : 'image/jpeg', cacheControl: '31536000' });
      if (u2.error) { alert(u2.error.message); await supabase.storage.from(BUCKET).remove([tp]); continue; }
      photos = [...photos, { t: pub(tp), f: pub(fp), tp, fp }];
      const up = await supabase.from('client_galleries').update({ photos }).eq('id', r.id);
      if (up.error) { alert(up.error.message); break; }
      ok++;
      const snap = photos;
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, photos: snap } : x)));
    }
    setMsg(`Done. ${ok} photo(s) added.`);
  }

  async function removePhoto(r, idx) {
    if (!confirm('Remove this photo from the gallery?')) return;
    const p = r.photos[idx];
    const photos = r.photos.filter((_, j) => j !== idx);
    const { error } = await supabase.from('client_galleries').update({ photos }).eq('id', r.id);
    if (error) return alert(error.message);
    const paths = [p.tp, p.fp].filter(Boolean);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    set(r.id, 'photos', photos);
  }

  async function removeGallery(r) {
    if (!confirm('Delete this whole gallery and all its photos? This cannot be undone.')) return;
    const paths = (r.photos || []).flatMap((p) => [p.tp, p.fp]).filter(Boolean);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error } = await supabase.from('client_galleries').delete().eq('id', r.id);
    if (error) alert(error.message);
    load();
  }

  return (
    <div className="adm">
      <style>{CSS}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Client galleries ({rows.length})</h2><a className="btn ghost" href="/admin">← Admin</a>
      </div>
      {err && <p style={{ color: '#ff8a80' }}>{err}</p>}

      <div className="row">
        <label>New gallery title</label>
        <input value={newT} onChange={(e) => setNewT(e.target.value)} placeholder="e.g. Anne and Tunde Wedding" />
        <button className="btn" onClick={create}>+ Create gallery</button>
      </div>

      <div className="row">
        <label>Photo quality for uploads</label>
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="high">High (3000px, smaller files, recommended)</option>
          <option value="original">Original (largest files, slowest upload)</option>
        </select>
        {msg && <p className="price">{msg}</p>}
      </div>

      {rows.map((r) => (
        <div className="row" key={r.id}>
          <h4 onClick={() => setOpen(open === r.id ? null : r.id)}>
            {open === r.id ? '▾' : '▸'} {r.title} · {r.code} · {(r.photos || []).length} photos{r.is_active ? '' : ' · hidden'}
          </h4>
          {open === r.id && (
            <>
              <label>Title</label>
              <input value={r.title || ''} onChange={(e) => set(r.id, 'title', e.target.value)} />
              <label>Client WhatsApp number (optional, digits only)</label>
              <input value={r.client_phone || ''} onChange={(e) => set(r.id, 'client_phone', e.target.value)} placeholder="2348012345678" />
              <label>Access code</label>
              <input value={r.code || ''} onChange={(e) => set(r.id, 'code', e.target.value.toUpperCase())} />
              <div className="cgs"><button className="btn ghost" onClick={() => set(r.id, 'code', makeCode())}>Make a new code</button></div>
              <label>Message to the client (optional)</label>
              <textarea rows={3} value={r.message || ''} onChange={(e) => set(r.id, 'message', e.target.value)} />
              <label>Available until (optional)</label>
              <input type="date" value={r.expires_on || ''} onChange={(e) => set(r.id, 'expires_on', e.target.value)} />
              <label className="chk"><input type="checkbox" checked={!!r.allow_download} onChange={(e) => set(r.id, 'allow_download', e.target.checked)} />Allow downloads</label>
              <label className="chk"><input type="checkbox" checked={!!r.is_active} onChange={(e) => set(r.id, 'is_active', e.target.checked)} />Gallery is open (untick to close it)</label>
              <button className="btn" onClick={() => save(r)}>Save details</button>

              <h4 style={{ marginTop: 20 }}>Share with your client</h4>
              <p className="cglink">{link(r)}</p>
              <div className="cgs">
                <button className="btn" onClick={() => copyLink(r)}>Copy message</button>
                <a className="btn" target="_blank" rel="noopener noreferrer"
                  href={`https://wa.me/${digits(r.client_phone)}?text=${encodeURIComponent(shareText(r))}`}>Send on WhatsApp</a>
                <a className="btn ghost" target="_blank" rel="noopener noreferrer" href={link(r)}>Open gallery</a>
              </div>

              <h4 style={{ marginTop: 20 }}>Photos</h4>
              <input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(r, e.target.files); e.target.value = ''; }} />
              <div className="cgt">
                {(r.photos || []).map((p, i) => (
                  <div key={(p.fp || p.f) + i}><img src={p.t || p.f} alt="" loading="lazy" />
                    <button aria-label="Remove photo" onClick={() => removePhoto(r, i)}>×</button></div>
                ))}
              </div>
              <button className="btn danger" onClick={() => removeGallery(r)}>Delete whole gallery</button>
            </>
          )}
        </div>
      ))}
      {rows.length === 0 && !err && <p className="mute">No galleries yet. Create one above.</p>}
    </div>
  );
}
