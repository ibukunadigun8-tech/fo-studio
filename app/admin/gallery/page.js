'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import '../../site.css';

async function shrink(file, max = 1800) {
  try {
    const bmp = await createImageBitmap(file);
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * r);
    cv.height = Math.round(bmp.height * r);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.82));
    return blob || file;
  } catch (e) { return file; }
}

export default function GalleryAdmin() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [cat, setCat] = useState('');
  const [msg, setMsg] = useState('');
  const load = async () => {
    const { data } = await supabase.from('gallery').select('*').order('sort_order', { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) load(); }); }, []);
  if (session === undefined) return <div className="load">…</div>;
  if (!session) return <div className="adm"><h2>Please log in first</h2><a className="btn" href="/admin">Go to admin login</a></div>;

  const cats = Array.from(new Set(rows.map((r) => (r.category || '').trim()).filter(Boolean)));
  const maxSort = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), 0);

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      setMsg(`Uploading ${i + 1} of ${files.length}…`);
      const blob = await shrink(files[i]);
      const path = `gallery/${Date.now()}-${i}.jpg`;
      const up = await supabase.storage.from('site-media').upload(path, blob, { contentType: 'image/jpeg' });
      if (up.error) { alert(up.error.message); continue; }
      const url = supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl;
      const ins = await supabase.from('gallery').insert({ image_url: url, category: cat.trim() || null, caption: '', sort_order: maxSort + 1 + i });
      if (ins.error) alert(ins.error.message); else ok++;
    }
    setMsg(`Done. ${ok} photo(s) added.`);
    e.target.value = '';
    load();
  }
  const upd = async (id, patch) => { await supabase.from('gallery').update(patch).eq('id', id); load(); };
  const del = async (id) => { if (confirm('Delete this photo?')) { await supabase.from('gallery').delete().eq('id', id); load(); } };

  return (
    <div className="adm">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Portfolio photos ({rows.length})</h2><a className="btn ghost" href="/admin">← Admin</a>
      </div>
      <div className="row">
        <label>Category for the photos you are about to add</label>
        <input list="cats" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="e.g. Weddings, Portraits, Studio, Corporate" />
        <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        <label>Choose photos (you can select many)</label>
        <input type="file" accept="image/*" multiple onChange={onFiles} />
        {msg && <p className="price">{msg}</p>}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        {rows.map((r) => (
          <div className="gtile" key={r.id}>
            <img src={r.image_url} alt="" />
            <input defaultValue={r.category || ''} placeholder="Category" onBlur={(e) => e.target.value !== (r.category || '') && upd(r.id, { category: e.target.value.trim() || null })} />
            <input defaultValue={r.caption || ''} placeholder="Caption (optional)" onBlur={(e) => e.target.value !== (r.caption || '') && upd(r.id, { caption: e.target.value })} />
            <label className="chk"><input type="checkbox" checked={!!r.is_active} onChange={(e) => upd(r.id, { is_active: e.target.checked })} />Visible</label>
            <button className="btn danger sm" onClick={() => del(r.id)}>Delete</button>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="mute">No photos yet. Choose some above.</p>}
    </div>
  );
}
