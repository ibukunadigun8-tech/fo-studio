'use client';
import Link from 'next/link';
import { useSite, money, Shell } from '../lib/data';

export default function Home() {
  const d = useSite(['spaces', 'services', 'testimonials', 'event_types', 'trusted_by', 'gallery']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const ig = [...d.gallery].reverse().slice(0, 6);
  return (
    <Shell c={c}>
      <header className="hero" style={c.hero_image ? { backgroundImage: `url(${c.hero_image})` } : {}}>
        <div className="wrap">
          <p className="eyebrow">{c.studio_full_name}</p>
          <h1>{c.hero_title}</h1>
          <p>{c.hero_subtitle}</p>
          <Link className="btn" href="/spaces">Explore the studio</Link>{' '}
          <Link className="btn ghost" href="/events">Explore events</Link>
        </div>
      </header>

      {d.trusted_by.length > 0 && (
        <section><div className="wrap">
          <p className="eyebrow" style={{ textAlign: 'center' }}>{c.trusted_title || 'Trusted by'}</p>
          <div className="trust">{d.trusted_by.map((t) => (
            t.logo_url ? <img key={t.id} src={t.logo_url} alt={t.name} loading="lazy" /> : <span key={t.id}>{t.name}</span>
          ))}</div>
        </div></section>
      )}

      <section><div className="wrap">
        <p className="eyebrow">What we do</p>
        <h2>Two ways to work with us</h2>
        <div className="grid">
          <div className="card"><div className="body">
            <h3>In the studio</h3>
            <p className="mute">Photo shoots, podcasts and content creation in fully equipped studio spaces you can book by the hour.</p>
            <p><Link className="btn sm" href="/spaces">Explore the studio</Link></p>
          </div></div>
          <div className="card"><div className="body">
            <h3>On location</h3>
            <p className="mute">Weddings, naming ceremonies, birthdays, corporate events and more, captured wherever the celebration is.</p>
            <p><Link className="btn sm" href="/events">Explore events</Link></p>
          </div></div>
        </div>
      </div></section>

      <section><div className="wrap">
        <p className="eyebrow">{c.tagline}</p><h2>{c.about_title}</h2>
        <p className="mute" style={{ maxWidth: 700, fontSize: 18 }}>{c.about_text}</p>
        <Link className="btn ghost" href="/about">Our story</Link>
      </div></section>

      <section><div className="wrap">
        <p className="eyebrow">The studio</p>
        <h2>{c.spaces_title}</h2>
        <div className="grid">{d.spaces.slice(0, 3).map((s) => (
          <Link key={s.id} href="/spaces" style={{ textDecoration: 'none' }}><div className="card">
            {s.images?.[0] ? <img src={s.images[0]} alt={s.name} /> : <div className="ph" />}
            <div className="body"><h3>{s.name}</h3><p className="mute">{s.tagline}</p><p className="price">{money(c, s.hourly_price)} / hour</p></div>
          </div></Link>))}</div>
        <p><Link className="btn ghost" href="/spaces">All spaces</Link></p>
      </div></section>

      {d.event_types.length > 0 && (
        <section><div className="wrap">
          <p className="eyebrow">On location</p>
          <h2>{c.events_title || 'Events'}</h2>
          <p className="mute" style={{ maxWidth: 700 }}>{c.events_intro}</p>
          <div className="grid" style={{ marginTop: 20 }}>{d.event_types.map((t) => (
            <Link key={t.id} href="/events" style={{ textDecoration: 'none' }}><div className="card">
              {t.cover_image ? <img src={t.cover_image} alt={t.name} /> : <div className="ph" />}
              <div className="body">
                <h3>{t.name}</h3>
                <p className="mute">{t.tagline}</p>
                {t.starting_price ? <p className="price">From {money(c, t.starting_price)}</p> : null}
              </div>
            </div></Link>))}</div>
          <p><Link className="btn ghost" href="/events">All events and packages</Link></p>
        </div></section>
      )}

      <section><div className="wrap">
        <h2>{c.services_title}</h2>
        <div className="grid">{d.services.map((s) => (
          <div className="card" key={s.id}><div className="body"><h3>{s.title}</h3><p className="mute">{s.description}</p></div></div>))}</div>
      </div></section>

      <section><div className="wrap">
        <h2>{c.testimonials_title}</h2>
        <div className="grid">{d.testimonials.map((t) => (
          <div className="card" key={t.id}><div className="body">
            {t.photo_url && <img className="avatar" src={t.photo_url} alt={t.client_name} loading="lazy" />}
            <p>“{t.quote}”</p>
            <p className="price">{t.client_name}<span className="mute"> · {t.client_role}</span></p>
          </div></div>))}</div>
      </div></section>

      {c.instagram && ig.length > 0 && (
        <section><div className="wrap">
          <p className="eyebrow">Follow along</p>
          <h2>{c.instagram_handle || 'Instagram'}</h2>
          <div className="igstrip">{ig.map((g) => (
            <a key={g.id} href={c.instagram} target="_blank" rel="noopener noreferrer"><img src={g.image_url} alt={g.caption || ''} loading="lazy" /></a>
          ))}</div>
          <a className="btn ghost" href={c.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
        </div></section>
      )}

      <div className="band">
        <h2>Ready to create?</h2>
        <Link className="btn" href="/spaces">Explore the studio</Link>{' '}
        <Link className="btn ghost" href="/events">Explore events</Link>
      </div>
    </Shell>
  );
}
