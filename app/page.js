'use client';
import Link from 'next/link';
import { useSite, money, Shell } from '../lib/data';

export default function Home() {
  const d = useSite(['spaces', 'services', 'testimonials']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  return (
    <Shell c={c}>
      <header className="hero" style={c.hero_image ? { backgroundImage: `url(${c.hero_image})` } : {}}>
        <div className="wrap">
          <p className="eyebrow">{c.studio_full_name}</p>
          <h1>{c.hero_title}</h1>
          <p>{c.hero_subtitle}</p>
          <Link className="btn" href="/book">{c.hero_cta || 'Book a session'}</Link>{' '}
          <Link className="btn ghost" href="/spaces">View spaces</Link>
        </div>
      </header>
      <section><div className="wrap">
        <p className="eyebrow">{c.tagline}</p><h2>{c.about_title}</h2>
        <p className="mute" style={{ maxWidth: 700, fontSize: 18 }}>{c.about_text}</p>
        <Link className="btn ghost" href="/about">Learn more</Link>
      </div></section>
      <section><div className="wrap">
        <h2>{c.spaces_title}</h2>
        <div className="grid">{d.spaces.slice(0, 3).map((s) => (
          <Link key={s.id} href={`/book?space=${s.slug}`} style={{ textDecoration: 'none' }}><div className="card">
            {s.images?.[0] ? <img src={s.images[0]} alt={s.name} /> : <div className="ph" />}
            <div className="body"><h3>{s.name}</h3><p className="mute">{s.tagline}</p><p className="price">{money(c, s.hourly_price)} / hour</p></div>
          </div></Link>))}</div>
        <p><Link className="btn ghost" href="/spaces">All spaces</Link></p>
      </div></section>
      <section><div className="wrap">
        <h2>{c.services_title}</h2>
        <div className="grid">{d.services.map((s) => (
          <div className="card" key={s.id}><div className="body"><h3>{s.title}</h3><p className="mute">{s.description}</p></div></div>))}</div>
      </div></section>
      <section><div className="wrap">
        <h2>{c.testimonials_title}</h2>
        <div className="grid">{d.testimonials.map((t) => (
          <div className="card" key={t.id}><div className="body"><p>“{t.quote}”</p>
            <p className="price">{t.client_name}<span className="mute"> · {t.client_role}</span></p></div></div>))}</div>
      </div></section>
      <div className="band"><h2>Ready to create?</h2><Link className="btn" href="/book">Book a session</Link></div>
    </Shell>
  );
}
