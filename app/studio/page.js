'use client';
import Link from 'next/link';
import { useSite, money, Shell } from '../../lib/data';

export default function Studio() {
  const d = useSite(['spaces']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  return (
    <Shell c={c}>
      <div className="wrap pg">
        <p className="lbl">// Also at our studio</p>
        <h1>The Studio</h1>
        <p className="mute" style={{ maxWidth: 700, fontSize: 18 }}>{c.studio_intro}</p>

        <div className="grid" style={{ marginTop: 30 }}>
          {d.spaces.map((s) => (
            <div className="card" key={s.id}>
              {s.images?.[0] ? <img src={s.images[0]} alt={s.name} loading="lazy" /> : <div className="ph" />}
              <div className="body">
                <h3>{s.name}</h3>
                <p className="mute">{s.tagline}</p>
                <p className="spec">
                  {s.size_sqft ? `${s.size_sqft} sq ft` : ''}{s.capacity ? ` · up to ${s.capacity} people` : ''}{s.min_hours ? ` · min ${s.min_hours} hr` : ''}
                </p>
                {(s.equipment || []).length > 0 && (
                  <ul className="mute" style={{ paddingLeft: 18, fontSize: 14 }}>{s.equipment.map((x) => <li key={x}>{x}</li>)}</ul>
                )}
                <p className="price">{money(c, s.hourly_price)} / hour</p>
                <Link className="btn sm" href={`/book?space=${s.slug}`}>Book this space</Link>
              </div>
            </div>
          ))}
        </div>

        {c.studio_rules && (<><h2 style={{ marginTop: 40 }}>Studio rules</h2><p className="mute" style={{ whiteSpace: 'pre-line' }}>{c.studio_rules}</p></>)}
        {c.cancellation_policy && (<><h2>Cancellation</h2><p className="mute" style={{ whiteSpace: 'pre-line' }}>{c.cancellation_policy}</p></>)}

        <p style={{ marginTop: 30 }}>
          <Link className="btn" href="/book">Book a space</Link>{' '}
          <Link className="btn ghost" href="/events">Explore events</Link>
        </p>
      </div>
    </Shell>
  );
}
