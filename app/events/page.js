'use client';
import Link from 'next/link';
import { useSite, money, Shell } from '../../lib/data';

const depText = (c, p) => {
  if (p.deposit_type === 'percent') return `Deposit: ${Number(p.deposit_value)}% to hold your date`;
  if (p.deposit_type === 'fixed') return `Deposit: ${money(c, p.deposit_value)} to hold your date`;
  return 'No deposit required';
};

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
