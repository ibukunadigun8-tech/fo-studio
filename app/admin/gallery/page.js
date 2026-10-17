'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import '../../site.css';

const PRESETS = ['Weddings', 'Naming ceremonies', 'Portraits', 'Studio', 'Corporate', 'Birthdays', 'Behind the scenes'];

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

  const used = rows.map((r) => (r.category || '').trim()).filter(Boolean);
  const all = Array.from(new Set([...PRESETS, ...used]));
  const uncat = rows.filter((r) => !(r.category || '').trim());
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
    setMsg(`Done. ${ok} photo(s) added${cat.trim() ? ' to ' + cat.trim() : ' (no category)'}.`);
    e.target.value = '';
    load();
  }
  const upd = async (id, patch) => { await supabase.from('gallery').update(patch).eq('id', id); load(); };
  const del = async (id) => { if (confirm('Delete this photo?')) { await supabase.from('gallery').delete().eq('id', id); load(); } };
  const applyAll = async () => {
    if (!cat.trim()) return alert('Tap a category above first.');
    await supabase.from('gallery').update({ category: cat.trim() }).in('id', uncat.map((r) => r.id));
    setMsg(`${uncat.length} photo(s) set to ${cat.trim()}.`);
    load();
  };

  return (
    <div className="adm">
      <style>{`.gtile .chk{display:flex;gap:8px;align-items:center;font-size:12px;margin:6px 0}.gtile .chk input{width:auto;margin:0}.gtile .btn{width:100%}.gtile select{width:100%;margin:0 0 6px}`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Portfolio photos ({rows.length})</h2><a className="btn ghost" href="/admin">← Admin</a>
      </div>

      <div className="row">
        <label>1. Tap a category (or type your own)</label>
        <div className="pills" style={{ flexWrap: 'wrap', overflow: 'visible' }}>
          {all.map((x) => <button key={x} type="button" className={'pill' + (cat === x ? ' on' : '')} onClick={() => setCat(cat === x ? '' : x)}>{x}</button>)}
        </div>
        <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Or type a new category" />
        <p className="mute">Selected: <b className="price">{cat.trim() || 'none'}</b></p>

        <label>2. Choose photos (you can select many)</label>
        <input type="file" accept="image/*" multiple onChange={onFiles} />
        {msg && <p className="price">{msg}</p>}

        {uncat.length > 0 && (
          <button type="button" className="btn ghost" onClick={applyAll}>
            Apply “{cat.trim() || 'selected category'}” to the {uncat.length} photo(s) with no category
          </button>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        {rows.map((r) => (
          <div className="gtile" key={r.id}>
            <img src={r.image_url} alt="" />
            <select value={(r.category || '').trim()} onChange={(e) => upd(r.id, { category: e.target.value || null })}>
              <option value="">No category</option>
              {all.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
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
