'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSite, money, Shell } from '../../../lib/data';

export default function EventBookPage() {
  const d = useSite(['event_types', 'event_packages', 'event_addons']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  return <Shell c={d.c}><EventBook d={d} /></Shell>;
}

function EventBook({ d }) {
  const { c } = d;
  const [f, setF] = useState({ type_id: d.event_types[0]?.id || '', pkg: 'custom', name: '', email: '', phone: '', date: '', time: '', venue: '', city: '', guests: '', notes: '', addons: [] });
  const [err, setErr] = useState(''); const [done, setDone] = useState(null); const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = d.event_types.find((x) => x.slug === q.get('type'));
    const pkg = q.get('pkg');
    setF((p) => ({ ...p, type_id: t ? t.id : p.type_id, pkg: pkg || 'custom' }));
  }, []);

  const type = d.event_types.find((t) => t.id === f.type_id);
  const pkgs = d.event_packages.filter((p) => p.event_type_id === f.type_id);
  const pkg = pkgs.find((p) => p.id === f.pkg);
  const picked = d.event_addons.filter((a) => f.addons.includes(a.id));
  const total = (pkg ? Number(pkg.price) : 0) + picked.reduce((n, a) => n + Number(a.price), 0);
  let deposit = 0;
  if (pkg) {
    if (pkg.deposit_type === 'percent') deposit = Math.round((total * Number(pkg.deposit_value)) / 100);
    else if (pkg.deposit_type === 'fixed') deposit = Number(pkg.deposit_value);
  }
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!type) return setErr('Please choose an event type.');
    if (!f.name || !f.email || !f.phone || !f.date) return setErr('Please fill in your name, email, phone and event date.');
    setBusy(true);
    const ref = 'EV' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const addonNames = picked.map((a) => a.name).join(', ');
    const row = {
      ref_code: ref, event_type_id: type.id, event_type_name: type.name,
      package_id: pkg ? pkg.id : null, package_name: pkg ? pkg.name : 'Custom quote',
      customer_name: f.name, customer_email: f.email, customer_phone: f.phone,
      event_date: f.date, start_time: f.time, venue: f.venue, city: f.city,
      guests: f.guests ? Number(f.guests) : null, addons: addonNames, notes: f.notes,
      estimated_total: pkg ? total : null, deposit_due: pkg ? deposit : null,
    };
    const { error } = await supabase.from('event_requests').insert(row);
    if (error) { setBusy(false); return setErr('Could not send: ' + error.message); }
    fetch('https://formsubmit.co/ajax/' + c.email, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New EVENT request ${ref} - ${type.name}`, _template: 'table', _captcha: 'false',
        Reference: ref, Name: f.name, email: f.email, Phone: f.phone, Event: type.name,
        Package: row.package_name, Date: f.date, Time: f.time, Venue: f.venue, City: f.city,
        Guests: f.guests, Addons: addonNames, Estimated_total: pkg ? money(c, total) : 'Custom quote',
        Deposit: pkg ? money(c, deposit) : '-', Notes: f.notes,
      }),
    }).catch(() => {});
    setBusy(false); setDone({ ref, row });
  }

  if (done) {
    const r = done.row;
    const msg = `Hi ${c.studio_name}, I just requested an event booking.\nRef: ${done.ref}\nEvent: ${r.event_type_name} (${r.package_name})\nDate: ${r.event_date}\nName: ${r.customer_name}`;
    return (
      <div className="wrap pg" style={{ maxWidth: 640 }}><div className="ok">
        <p className="eyebrow">Request received</p>
        <h2>Thank you, {r.customer_name.split(' ')[0]}.</h2>
        <p>Your reference is <b className="price">{done.ref}</b>. We have your request for <b>{r.event_type_name}</b> ({r.package_name}) on {r.event_date}. We will contact you shortly to confirm availability.</p>
        {r.estimated_total != null ? (
          <>
            <p>Estimated total: <b className="price">{money(c, r.estimated_total)}</b></p>
            {r.deposit_due > 0 && <p>Deposit to hold your date: <b className="price">{money(c, r.deposit_due)}</b></p>}
          </>
        ) : <p>We will send you a custom quote.</p>}
        {(c.bank_name || c.account_no) && r.deposit_due > 0 && (
          <><h3>Payment details</h3>
            <p>Bank: {c.bank_name}<br />Account No: {c.account_no}<br />Account Name: {c.account_name}</p>
            <p className="mute">{c.payment_instructions}</p></>
        )}
        {c.events_policy && <p className="mute">{c.events_policy}</p>}
        <a className="btn" href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`}>Continue on WhatsApp</a>
      </div></div>
    );
  }

  return (
    <div className="wrap pg" style={{ maxWidth: 640 }}>
      <p className="eyebrow">Events</p><h1>Book an event</h1>
      <form className="form" onSubmit={submit}>
        <label>Event type</label>
        <select value={f.type_id} onChange={(e) => setF((p) => ({ ...p, type_id: e.target.value, pkg: 'custom' }))}>
          {d.event_types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <label>Package</label>
        <select value={f.pkg} onChange={(e) => set('pkg', e.target.value)}>
          {pkgs.map((p) => <option key={p.id} value={p.id}>{p.name} - {money(c, p.price)}</option>)}
          <option value="custom">Custom quote (tell us what you need)</option>
        </select>
        <label>Event date</label><input type="date" min={today} value={f.date} onChange={(e) => set('date', e.target.value)} />
        <div className="two">
          <div><label>Start time</label><input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} /></div>
          <div><label>Guests (approx.)</label><input type="number" value={f.guests} onChange={(e) => set('guests', e.target.value)} /></div>
        </div>
        <label>Venue</label><input value={f.venue} onChange={(e) => set('venue', e.target.value)} />
        <label>City</label><input value={f.city} onChange={(e) => set('city', e.target.value)} />
        {d.event_addons.length > 0 && <><label>Add-ons</label>{d.event_addons.map((a) => (
          <label className="chk" key={a.id}><input type="checkbox" checked={f.addons.includes(a.id)}
            onChange={(e) => set('addons', e.target.checked ? [...f.addons, a.id] : f.addons.filter((x) => x !== a.id))} />{a.name} (+{money(c, a.price)})</label>
        ))}</>}
        <label>Full name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} />
        <label>Email</label><input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
        <label>Phone / WhatsApp</label><input type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        <label>Tell us about your event</label><textarea rows={4} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
        {pkg ? (
          <div className="total">Estimated total: {money(c, total)}{deposit > 0 && <div className="dep">Deposit to hold date: {money(c, deposit)}</div>}</div>
        ) : <div className="total">We will send you a custom quote</div>}
        <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send event request'}</button>
        {err && <p className="err">{err}</p>}
      </form>
    </div>
  );
}
