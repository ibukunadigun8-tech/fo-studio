'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [d, setD] = useState(null);
  useEffect(() => {
    (async () => {
      const q = (t) => supabase.from(t).select('*').order('sort_order');
      const [s, sp, sv, f, t, g] = await Promise.all(
        ['site_settings', 'spaces', 'services', 'faqs', 'testimonials', 'gallery'].map(q)
      );
      const c = {};
      (s.data || []).forEach((r) => (c[r.key] = r.value));
      setD({ c, spaces: sp.data || [], services: sv.data || [], faqs: f.data || [], tests: t.data || [], gallery: g.data || [] });
    })();
  }, []);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const money = (n) => (c.currency_symbol || '') + Number(n || 0).toLocaleString();
  const wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Hi ' + c.studio_name + ', I would like to book a session.')}`;

  return (
    <>
      <nav><div className="wrap">
        <span className="logo">{c.studio_name}</span>
        <a className="btn" href={wa}>{c.hero_cta || 'Book'}</a>
      </div></nav>

      <header className="hero" style={c.hero_image ? { backgroundImage: `url(${c.hero_image})` } : {}}>
        <div className="wrap">
          <p className="eyebrow">{c.studio_full_name}</p>
          <h1>{c.hero_title}</h1>
          <p>{c.hero_subtitle}</p>
          <a className="btn" href="#spaces">View spaces</a>
        </div>
      </header>

      <section><div className="wrap">
        <p className="eyebrow">{c.tagline}</p>
        <h2>{c.about_title}</h2>
        <p className="mute" style={{ maxWidth: 700, fontSize: 18 }}>{c.about_text}</p>
      </div></section>

      <section id="spaces"><div className="wrap">
        <h2>{c.spaces_title}</h2>
        <div className="grid">
          {d.spaces.map((s) => (
            <div className="card" key={s.id}>
              {s.images?.[0] ? <img src={s.images[0]} alt={s.name} /> : <div className="ph" />}
              <div className="body">
                <h3>{s.name}</h3>
                <p className="mute">{s.tagline}</p>
                <p className="mute" style={{ fontSize: 14 }}>{s.description}</p>
                <div className="tags">{(s.equipment || []).map((e) => <span key={e}>{e}</span>)}</div>
                <p className="price">{money(s.hourly_price)} / hour · up to {s.capacity} people</p>
                <a className="btn" href={wa}>Book this space</a>
              </div>
            </div>
          ))}
        </div>
      </div></section>

      <section><div className="wrap">
        <h2>{c.services_title}</h2>
        <div className="grid">
          {d.services.map((s) => (
            <div className="card" key={s.id}><div className="body">
              <h3>{s.title}</h3><p className="mute">{s.description}</p>
              {s.starting_price ? <p className="price">From {money(s.starting_price)}</p> : null}
            </div></div>
          ))}
        </div>
      </div></section>

      {d.gallery.length > 0 && <section><div className="wrap">
        <h2>Portfolio</h2>
        <div className="grid">{d.gallery.map((g) => <img key={g.id} src={g.image_url} alt={g.caption || ''} style={{ width: '100%', height: 260, objectFit: 'cover' }} />)}</div>
      </div></section>}

      <section><div className="wrap">
        <h2>{c.testimonials_title}</h2>
        <div className="grid">
          {d.tests.map((t) => (
            <div className="card" key={t.id}><div className="body">
              <p>“{t.quote}”</p><p className="price">{t.client_name}<span className="mute"> · {t.client_role}</span></p>
            </div></div>
          ))}
        </div>
      </div></section>

      <section><div className="wrap" style={{ maxWidth: 760 }}>
        <h2>{c.faq_title}</h2>
        {d.faqs.map((f) => <details key={f.id}><summary>{f.question}</summary><p className="mute">{f.answer}</p></details>)}
      </div></section>

      <footer><div className="wrap">
        <p>{c.address} · {c.phone} · {c.email}</p>
        <p>{c.opening_hours}</p>
        <p>{c.footer_text}</p>
      </div></footer>
    </>
  );
}
