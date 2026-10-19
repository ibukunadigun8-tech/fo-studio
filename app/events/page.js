'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useSite, money, Shell } from '../../lib/data';

const depText = (c, p) => {
  if (p.deposit_type === 'percent') return `Deposit: ${Number(p.deposit_value)}% to hold your date`;
  if (p.deposit_type === 'fixed') return `Deposit: ${money(c, p.deposit_value)} to hold your date`;
  return 'No deposit required';
};

function LeadForm({ c, types }) {
  const [f, setF] = useState({ name: '', phone: '', interest: types[0]?.name || '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!f.name.trim() || f.phone.replace(/\D/g, '').length < 7) return setErr('Please enter your name and a valid phone number.');
    setBusy(true);
    const { error } = await supabase.from('leads').insert({ name: f.name.trim(), phone: f.phone.trim(), interest: f.interest, source: 'pricing guide' });
    if (error) { setBusy(false); return setErr('Could not send: ' + error.message); }
    fetch('https://formsubmit.co/ajax/' + c.email, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: 'New pricing guide request - ' + f.name, _template: 'table', _captcha: 'false', Name: f.name, Phone: f.phone, Interested_in: f.interest }),
    }).catch(() => {});
    setBusy(false);
    setDone(true);
  }

  if (done) {
    const msg = `Hello ${c.studio_full_name}, I am ${f.name}. Please send me your pricing guide for ${f.interest}.`;
    return (
      <div className="ok">
        <h3>Thank you, {f.name.split(' ')[0]}.</h3>
        <p className="mute">We have your request and will send the pricing guide to your phone shortly.</p>
        {c.pricing_guide_url && <p><a className="btn" href={c.pricing_guide_url} target="_blank" rel="noopener noreferrer">Open pricing guide now</a></p>}
        {c.whatsapp && <p><a className="btn ghost" href={`https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></p>}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Your name</label>
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <label>Phone / WhatsApp</label>
      <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <label>What are you planning?</label>
      <select value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })}>
        {types.map((t) => <option key={t.id}>{t.name}</option>)}
      </select>
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send me the pricing guide'}</button>
      {err && <p className="err">{err}</p>}
    </form>
  );
}

export default function Events() {
  const d = useSite(['event_types', 'event_packages', 'event_addons', 'faqs']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const faqs = d.faqs.filter((f) => f.scope === 'events');
  return (
    <Shell c={c}>
      <div className="wrap pg">
        <p className="eyebrow">On location</p>
        <h1>{c.events_title || 'Events'}</h1>
        <p className="mute" style={{ maxWidth: 700, fontSize: 18 }}>{c.events_intro}</p>

        <div className="grid" style={{ marginTop: 30 }}>
          {d.event_types.map((t) => {
            const pk = d.event_packages.filter((p) => p.event_type_id === t.id);
            return (
              <div className="card" key={t.id}>
                {t.cover_image ? <img src={t.cover_image} alt={t.name} /> : <div className="ph" />}
                <div className="body">
                  <h3>{t.name}</h3>
                  <p className="mute">{t.tagline}</p>
                  <p className="mute" style={{ fontSize: 14 }}>{t.description}</p>
                  {t.images?.length > 0 && <div className="strip">{t.images.map((u) => <img key={u} src={u} alt="" loading="lazy" />)}</div>}
                  {t.starting_price ? <p className="price">From {money(c, t.starting_price)}</p> : null}
                  {pk.map((p) => (
                    <div className={'pkg' + (p.is_popular ? ' pop' : '')} key={p.id}>
                      {p.is_popular && <span className="badge">Most popular</span>}
                      <h3 style={{ margin: 0 }}>{p.name}</h3>
                      <p className="price" style={{ margin: '6px 0' }}>{money(c, p.price)}</p>
                      <p className="spec">{p.hours} hrs · {p.photographers} photographer{p.photographers > 1 ? 's' : ''} · {p.edited_photos} edited photos · delivered in {p.delivery_days} days</p>
                      <ul>{(p.includes || []).map((x) => <li key={x}>{x}</li>)}</ul>
                      <p className="dep">{depText(c, p)}</p>
                      <Link className="btn sm" href={`/events/book?type=${t.slug}&pkg=${p.id}`}>Choose {p.name}</Link>
                    </div>
                  ))}
                  <p style={{ marginTop: 16 }}>
                    <Link className="btn ghost" href={`/events/book?type=${t.slug}&pkg=custom`}>Request a custom quote</Link>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {d.event_addons.length > 0 && (
          <>
            <h2 style={{ marginTop: 50 }}>Add-ons</h2>
            <div className="grid">
              {d.event_addons.map((a) => (
                <div className="card" key={a.id}><div className="body">
                  <h3>{a.name}</h3><p className="mute">{a.description}</p><p className="price">+ {money(c, a.price)}</p>
                </div></div>
              ))}
            </div>
          </>
        )}

        {d.event_types.length > 0 && (
          <div style={{ marginTop: 50, maxWidth: 560 }}>
            <p className="eyebrow">Not ready to book?</p>
            <h2>Get our pricing guide</h2>
            <p className="mute">Leave your details and we will send you our full event pricing.</p>
            <LeadForm c={c} types={d.event_types} />
          </div>
        )}

        {faqs.length > 0 && (
          <>
            <h2 style={{ marginTop: 50 }}>Good to know</h2>
            {faqs.map((f) => <details key={f.id}><summary>{f.question}</summary><p className="mute">{f.answer}</p></details>)}
          </>
        )}

        {c.events_policy && <p className="mute" style={{ marginTop: 40, maxWidth: 700 }}>{c.events_policy}</p>}
        <p style={{ marginTop: 20 }}><Link className="btn" href="/events/book">Book an event</Link></p>
      </div>
    </Shell>
  );
}
