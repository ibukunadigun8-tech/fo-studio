'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useSite, money, priceText, pricesOn, Shell } from '../../lib/data';

export default function Page() {
  const { slug } = useParams();
  const d = useSite(['spaces', 'services', 'addons']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const V = { spaces: Spaces, services: Services, contact: Contact, book: Book }[slug];
  return <Shell c={d.c}>{V ? <V d={d} /> : <div className="wrap pg"><h1>Page not found</h1><Link className="btn" href="/">Home</Link></div>}</Shell>;
}

function Spaces({ d }) {
  const { c } = d;
  return (<div className="wrap pg"><p className="eyebrow">Studio</p><h1>{c.spaces_title}</h1>
    <div className="grid" style={{ marginTop: 30 }}>{d.spaces.map((s) => (
      <div className="card" key={s.id}>
        {s.images?.length ? <div className="strip">{s.images.map((u) => <img key={u} src={u} alt="" />)}</div> : <div className="ph" />}
        <div className="body"><h3>{s.name}</h3><p className="mute">{s.tagline}</p><p className="mute" style={{ fontSize: 14 }}>{s.description}</p>
          <div className="tags">{(s.equipment || []).map((e) => <span key={e}>{e}</span>)}</div>
          <p className="mute" style={{ fontSize: 14 }}>{s.size_sqft ? s.size_sqft + ' sq ft · ' : ''}up to {s.capacity} people · {s.min_hours}–{s.max_hours} hrs</p>
          {priceText(c, s.hourly_price) ? <p className="price">{priceText(c, s.hourly_price)} / hour</p> : null}
          <Link className="btn" href={`/book?space=${s.slug}`}>Book this space</Link></div>
      </div>))}</div></div>);
}

function Services({ d }) {
  const { c } = d;
  return (<div className="wrap pg"><p className="eyebrow">Services</p><h1>{c.services_title}</h1>
    <div className="grid" style={{ marginTop: 30 }}>{d.services.map((s) => (
      <div className="card" key={s.id}><div className="body"><h3>{s.title}</h3><p className="mute">{s.description}</p>
        {priceText(c, s.starting_price) ? <p className="price">From {priceText(c, s.starting_price)}</p> : null}</div></div>))}</div>
    {d.addons.length > 0 && <><h2 style={{ marginTop: 50 }}>Add-ons</h2>
      <div className="grid">{d.addons.map((a) => <div className="card" key={a.id}><div className="body"><h3>{a.name}</h3><p className="mute">{a.description}</p>{priceText(c, a.price) ? <p className="price">+ {priceText(c, a.price)}</p> : null}</div></div>)}</div></>}
    <p style={{ marginTop: 40 }}><Link className="btn" href="/book">Book a session</Link></p></div>);
}

function Contact({ d }) {
  const { c } = d;
  return (<div className="wrap pg" style={{ maxWidth: 700 }}><p className="eyebrow">Get in touch</p><h1>Contact</h1>
    <p>{c.address}</p><p>{c.opening_hours}</p>
    <p><a href={`tel:${c.phone}`}>{c.phone}</a></p><p><a href={`mailto:${c.email}`}>{c.email}</a></p>
    <p><a className="btn" href={`https://wa.me/${c.whatsapp}`}>WhatsApp us</a>{' '}
      {c.instagram && <a className="btn ghost" href={c.instagram}>Instagram</a>}{' '}
      {c.maps_link && <a className="btn ghost" href={c.maps_link}>Directions</a>}</p></div>);
}

function Book({ d }) {
  const { c } = d;
  const showP = pricesOn(c);
  const open = Number(c.open_hour || 9), close = Number(c.close_hour || 20);
  const [f, setF] = useState({ space_id: d.spaces[0]?.id || '', service: '', name: '', email: '', phone: '', date: '', start: open, hours: 1, notes: '', addons: [] });
  const [err, setErr] = useState(''); const [done, setDone] = useState(null); const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('space');
    const s = d.spaces.find((x) => x.slug === q);
    if (s) set('space_id', s.id);
  }, []);
  const space = d.spaces.find((s) => s.id === f.space_id);
  const picked = d.addons.filter((a) => f.addons.includes(a.id));
  const total = (space ? space.hourly_price * f.hours : 0) + picked.reduce((n, a) => n + Number(a.price), 0);
  const hh = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!space) return setErr('Please choose a space.');
    if (!f.name || !f.email || !f.phone || !f.date) return setErr('Please fill in your name, email, phone and date.');
    if (f.start + f.hours > close) return setErr(`We close at ${hh(close)}. Please pick an earlier start or fewer hours.`);
    if (space.min_hours && f.hours < space.min_hours) return setErr(`Minimum for this space is ${space.min_hours} hour(s).`);
    if (space.max_hours && f.hours > space.max_hours) return setErr(`Maximum for this space is ${space.max_hours} hours.`);
    setBusy(true);
    const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
    const addonNames = picked.map((a) => a.name).join(', ');
    const row = { ref_code: ref, space_id: space.id, space_name: space.name, service: f.service, customer_name: f.name, customer_email: f.email, customer_phone: f.phone,
      session_date: f.date, start_time: hh(f.start), hours: f.hours, notes: (f.notes + (addonNames ? ` | Add-ons: ${addonNames}` : '')).trim(), estimated_total: total };
    const { error } = await supabase.from('booking_requests').insert(row);
    if (error) { setBusy(false); return setErr('Could not send: ' + error.message); }
    fetch('https://formsubmit.co/ajax/' + c.email, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `New booking request ${ref} - ${space.name}`, _template: 'table', _captcha: 'false', Reference: ref, Name: f.name, email: f.email, Phone: f.phone,
        Space: space.name, Service: f.service, Date: f.date, Time: hh(f.start), Hours: f.hours, Addons: addonNames, Estimated_total: money(c, total), Notes: f.notes }) }).catch(() => {});
    setBusy(false); setDone({ ref, space: space.name, row });
  }

  if (done) {
    const r = done.row;
    const msg = `Hi ${c.studio_name}, I just requested a booking.\nRef: ${done.ref}\nSpace: ${done.space}\nDate: ${r.session_date}, ${r.start_time} (${r.hours}hr)\nName: ${r.customer_name}`;
    return (<div className="wrap pg" style={{ maxWidth: 640 }}><div className="ok">
      <p className="eyebrow">Request received</p><h2>Thank you, {r.customer_name.split(' ')[0]}.</h2>
      <p>Your reference is <b className="price">{done.ref}</b>. We have your request for <b>{done.space}</b> on {r.session_date} at {r.start_time} ({r.hours} hr). We will confirm shortly.</p>
      {showP ? <p>Estimated total: <b className="price">{money(c, r.estimated_total)}</b></p> : <p>We will send you a quote shortly.</p>}
      {showP && (c.bank_name || c.account_no) && <><h3>Payment details</h3>
        <p>Bank: {c.bank_name}<br />Account No: {c.account_no}<br />Account Name: {c.account_name}</p><p className="mute">{c.payment_instructions}</p></>}
      <a className="btn" href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`}>Continue on WhatsApp</a></div></div>);
  }

  return (<div className="wrap pg" style={{ maxWidth: 640 }}><p className="eyebrow">Reservations</p><h1>Book a session</h1>
    <form className="form" onSubmit={submit}>
      <label>Space</label>
      <select value={f.space_id} onChange={(e) => set('space_id', e.target.value)}>{d.spaces.map((s) => <option key={s.id} value={s.id}>{s.name}{priceText(c, s.hourly_price) ? ` - ${priceText(c, s.hourly_price)}/hr` : ''}</option>)}</select>
      <label>Service</label>
      <select value={f.service} onChange={(e) => set('service', e.target.value)}><option value="">Select (optional)</option>{d.services.map((s) => <option key={s.id}>{s.title}</option>)}</select>
      <label>Date</label><input type="date" min={today} value={f.date} onChange={(e) => set('date', e.target.value)} />
      <div className="two"><div><label>Start time</label>
        <select value={f.start} onChange={(e) => set('start', Number(e.target.value))}>{Array.from({ length: Math.max(close - open, 1) }, (_, i) => open + i).map((h) => <option key={h} value={h}>{hh(h)}</option>)}</select></div>
        <div><label>Hours</label><select value={f.hours} onChange={(e) => set('hours', Number(e.target.value))}>{Array.from({ length: space?.max_hours || 8 }, (_, i) => i + 1).map((h) => <option key={h}>{h}</option>)}</select></div></div>
      {d.addons.length > 0 && <><label>Add-ons</label>{d.addons.map((a) => (
        <label className="chk" key={a.id}><input type="checkbox" checked={f.addons.includes(a.id)} onChange={(e) => set('addons', e.target.checked ? [...f.addons, a.id] : f.addons.filter((x) => x !== a.id))} />{a.name}{priceText(c, a.price) ? ` (+${priceText(c, a.price)})` : ''}</label>))}</>}
      <label>Full name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} />
      <label>Email</label><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
      <label>Phone / WhatsApp</label><input type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
      <label>Notes (optional)</label><textarea rows={3} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
      {showP ? <div className="total">Estimated total: {money(c, total)}</div> : <div className="total">We will send you a quote</div>}
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send booking request'}</button>
      {err && <p className="err">{err}</p>}
    </form></div>);
}
