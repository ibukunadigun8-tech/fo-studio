'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

async function upload(file) {
  const p = Date.now() + '-' + file.name.replace(/[^a-z0-9.]/gi, '_');
  const { error } = await supabase.storage.from('site-media').upload(p, file);
  if (error) { alert(error.message); return null; }
  return supabase.storage.from('site-media').getPublicUrl(p).data.publicUrl;
}

const TABLES = {
  Spaces: { t: 'spaces', title: 'name', fields: [
    ['name', 'Name'], ['slug', 'URL slug (e.g. white-cyc)'], ['tagline', 'Tagline'], ['description', 'Description', 'area'],
    ['size_sqft', 'Size (sq ft)', 'num'], ['capacity', 'Capacity (people)', 'num'], ['hourly_price', 'Price per hour', 'num'],
    ['min_hours', 'Min hours', 'num'], ['max_hours', 'Max hours', 'num'], ['equipment', 'Equipment (one per line)', 'list'],
    ['images', 'Photos', 'imgs'], ['booking_mode', 'Booking mode', 'select', ['default', 'instant', 'request']],
    ['is_active', 'Visible on website', 'bool'], ['sort_order', 'Order', 'num']] },
  Services: { t: 'services', title: 'title', fields: [
    ['title', 'Title'], ['description', 'Description', 'area'], ['starting_price', 'Starting price', 'num'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  'Add-ons': { t: 'addons', title: 'name', fields: [
    ['name', 'Name'], ['description', 'Description', 'area'], ['price', 'Price', 'num'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  FAQ: { t: 'faqs', title: 'question', fields: [
    ['question', 'Question'], ['answer', 'Answer', 'area'],
    ['scope', 'Show on (general = About page, events = Events page)', 'select', ['general', 'events']],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  Reviews: { t: 'testimonials', title: 'client_name', fields: [
    ['client_name', 'Client name'], ['client_role', 'Role'], ['photo_url', 'Client photo (optional)', 'img'], ['quote', 'Quote', 'area'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  'Trusted by': { t: 'trusted_by', title: 'name', fields: [
    ['name', 'Client / brand name'], ['logo_url', 'Logo (optional, white or light works best)', 'img'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  Gallery: { t: 'gallery', title: 'caption', fields: [
    ['image_url', 'Photo', 'img'], ['caption', 'Caption'], ['category', 'Category'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
  'Event types': { t: 'event_types', title: 'name', fields: [
    ['name', 'Name'], ['slug', 'URL slug (e.g. weddings)'], ['tagline', 'Tagline'], ['description', 'Description', 'area'],
    ['cover_image', 'Cover photo', 'img'], ['images', 'More photos', 'imgs'],
    ['starting_price', 'Starting price (shown as "From")', 'num'],
    ['is_active', 'Visible on website', 'bool'], ['sort_order', 'Order', 'num']] },
  'Event packages': { t: 'event_packages', title: 'name', fields: [
    ['name', 'Package name (e.g. Basic)'], ['event_type_id', 'Event type', 'evtype'],
    ['price', 'Price', 'num'], ['hours', 'Hours of coverage', 'num'], ['photographers', 'Photographers', 'num'],
    ['edited_photos', 'Edited photos', 'num'], ['delivery_days', 'Delivery (days)', 'num'],
    ['includes', 'What is included (one per line)', 'list'],
    ['deposit_type', 'Deposit type', 'select', ['percent', 'fixed', 'none']],
    ['deposit_value', 'Deposit value (% if percent, amount if fixed)', 'num'],
    ['is_popular', 'Mark as Most popular', 'bool'],
    ['is_active', 'Visible on website', 'bool'], ['sort_order', 'Order', 'num']] },
  'Event add-ons': { t: 'event_addons', title: 'name', fields: [
    ['name', 'Name'], ['description', 'Description', 'area'], ['price', 'Price', 'num'],
    ['is_active', 'Visible', 'bool'], ['sort_order', 'Order', 'num']] },
};

function EvTypeSelect({ label, v, on }) {
  const [opts, setOpts] = useState([]);
  useEffect(() => { supabase.from('event_types').select('id,name').order('sort_order').then(({ data }) => setOpts(data || [])); }, []);
  return (<div><label>{label}</label>
    <select value={v || ''} onChange={(e) => on(e.target.value)}>{opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>);
}

function Field({ f, v, on }) {
  const [k, label, type, opts] = f;
  if (type === 'evtype') return <EvTypeSelect label={label} v={v} on={on} />;
  if (type === 'bool') return <label className="chk"><input type="checkbox" checked={!!v} onChange={(e) => on(e.target.checked)} />{label}</label>;
  if (type === 'img') return (<div><label>{label}</label>
    {v && <div className="thumbs"><div><img src={v} alt="" /></div></div>}
    <input type="file" accept="image/*" onChange={async (e) => { const u = e.target.files[0] && await upload(e.target.files[0]); if (u) on(u); }} /></div>);
  if (type === 'imgs') return (<div><label>{label}</label>
    <div className="thumbs">{(v || []).map((u, i) => <div key={u}><img src={u} alt="" /><b onClick={() => on(v.filter((_, j) => j !== i))}>×</b></div>)}</div>
    <input type="file" accept="image/*" multiple onChange={async (e) => { const out = [...(v || [])]; for (const fl of e.target.files) { const u = await upload(fl); if (u) out.push(u); } on(out); }} /></div>);
  if (type === 'list') return <div><label>{label}</label><textarea rows={4} value={(v || []).join('\n')} onChange={(e) => on(e.target.value.split('\n'))} /></div>;
  if (type === 'area') return <div><label>{label}</label><textarea rows={4} value={v ?? ''} onChange={(e) => on(e.target.value)} /></div>;
  if (type === 'select') return <div><label>{label}</label><select value={v || opts[0]} onChange={(e) => on(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></div>;
  if (type === 'num') return <div><label>{label}</label><input type="number" value={v ?? ''} onChange={(e) => on(e.target.value === '' ? null : Number(e.target.value))} /></div>;
  return <div><label>{label}</label><input value={v ?? ''} onChange={(e) => on(e.target.value)} /></div>;
}

function Editor({ cfg }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [tn, setTn] = useState({});
  const load = async () => {
    const { data } = await supabase.from(cfg.t).select('*').order('sort_order');
    setRows(data || []);
    if (cfg.t === 'event_packages') {
      const { data: t } = await supabase.from('event_types').select('id,name');
      setTn(Object.fromEntries((t || []).map((x) => [x.id, x.name])));
    }
  };
  useEffect(() => { load(); }, [cfg.t]);
  const set = (id, k, v) => setRows(rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const clean = (r) => {
    const { id, created_at, ...rest } = r;
    if (rest.equipment) rest.equipment = rest.equipment.map((x) => x.trim()).filter(Boolean);
    if (rest.includes) rest.includes = rest.includes.map((x) => x.trim()).filter(Boolean);
    if (cfg.t === 'spaces' && !rest.slug) rest.slug = (rest.name || 'space').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now() % 1000;
    if (cfg.t === 'event_types' && !rest.slug) rest.slug = (rest.name || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now() % 1000;
    return rest;
  };
  const save = async (r) => { const { error } = await supabase.from(cfg.t).update(clean(r)).eq('id', r.id); alert(error ? error.message : 'Saved'); load(); };
  const del = async (r) => { if (!confirm('Delete this?')) return; const { error } = await supabase.from(cfg.t).delete().eq('id', r.id); if (error) alert(error.message); load(); };
  const add = async () => {
    const first = cfg.fields[0][0];
    const base = { [first]: 'New item' };
    if (cfg.t === 'spaces') base.slug = 'space-' + Date.now();
    if (cfg.t === 'event_types') base.slug = 'event-' + Date.now();
    if (cfg.t === 'event_packages') {
      const { data } = await supabase.from('event_types').select('id').order('sort_order').limit(1);
      if (!data || !data.length) return alert('Add an event type first.');
      base.event_type_id = data[0].id;
    }
    if (cfg.t === 'faqs') base.answer = 'Answer';
    if (cfg.t === 'testimonials') base.quote = 'Quote';
    if (cfg.t === 'gallery') base.image_url = 'https://';
    const { error } = await supabase.from(cfg.t).insert(base);
    if (error) alert(error.message); load();
  };
  return (<div>
    <button className="btn" onClick={add}>+ Add new</button><br /><br />
    {rows.map((r) => (<div className="row" key={r.id}>
      <h4 onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? '▾' : '▸'} {r[cfg.title] || 'Untitled'}{cfg.t === 'event_packages' && tn[r.event_type_id] ? ' · ' + tn[r.event_type_id] : ''}</h4>
      {open === r.id && <>
        {cfg.fields.map((f) => <Field key={f[0]} f={f} v={r[f[0]]} on={(v) => set(r.id, f[0], v)} />)}
        <button className="btn" onClick={() => save(r)}>Save</button>{' '}
        <button className="btn danger" onClick={() => del(r)}>Delete</button>
      </>}
    </div>))}
  </div>);
}

function Content() {
  const [rows, setRows] = useState([]);
  useEffect(() => { supabase.from('site_settings').select('*').order('sort_order').then(({ data }) => setRows(data || [])); }, []);
  const set = (key, v) => setRows(rows.map((r) => (r.key === key ? { ...r, value: v } : r)));
  const save = async () => { const { error } = await supabase.from('site_settings').upsert(rows); alert(error ? error.message : 'All saved'); };
  let last = '';
  return (<div>
    {rows.map((r) => { const h = r.grp !== last; last = r.grp; return (<div key={r.key}>
      {h && <div className="grp">{r.grp}</div>}
      {/image|logo/.test(r.key) ? <Field f={[r.key, r.label, 'img']} v={r.value} on={(v) => set(r.key, v)} />
        : r.key === 'booking_mode' ? <Field f={[r.key, 'Booking mode (request = you approve, instant = auto-hold)', 'select', ['request', 'instant']]} v={r.value} on={(v) => set(r.key, v)} />
        : <Field f={[r.key, r.label || r.key, (r.value || '').length > 80 || r.key === 'about_story' ? 'area' : 'text']} v={r.value} on={(v) => set(r.key, v)} />}
    </div>); })}
    <button className="btn" onClick={save}>Save all content</button>
  </div>);
}

export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState('Content');
  const [em, setEm] = useState(''); const [pw, setPw] = useState('');
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <div className="load">…</div>;
  if (!session) return (<div className="adm" style={{ maxWidth: 380, marginTop: 80 }}>
    <h2>F.O Studio Admin</h2>
    <label>Email</label><input value={em} onChange={(e) => setEm(e.target.value)} />
    <label>Password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
    <button className="btn" onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw }); if (error) alert(error.message); }}>Log in</button>
  </div>);
  return (<div className="adm">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h2>Admin</h2><button className="btn ghost" onClick={() => supabase.auth.signOut()}>Log out</button>
    </div>
    <p>
      <a className="btn sm" href="/admin/requests">Booking requests</a>{' '}
      <a className="btn sm" href="/admin/event-requests">Event requests</a>{' '}
      <a className="btn sm" href="/admin/gallery">Portfolio photos</a>
    </p>
    <div className="tabs">{['Content', ...Object.keys(TABLES)].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === 'Content' ? <Content /> : <Editor key={tab} cfg={TABLES[tab]} />}
  </div>);
}
