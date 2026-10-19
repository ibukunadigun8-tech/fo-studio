'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite, money, Shell, Reveal, Marquee } from '../lib/data';

const HOME_CSS = `
.hs{position:absolute;inset:0;z-index:0;overflow:hidden;background:#000}
.hs img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.08);transition:opacity 1.4s ease}
.hs img.on{opacity:1;animation:hskb 9s ease-out forwards}
@keyframes hskb{from{transform:scale(1.08)}to{transform:scale(1)}}
.hs::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,.35) 45%,rgba(0,0,0,.88))}
.hero .wrap{position:relative;z-index:2}
.hero h1{font-size:clamp(44px,12vw,92px);line-height:1.02}
.hdots{position:absolute;left:0;right:0;bottom:18px;z-index:3;display:flex;justify-content:center;gap:10px}
.hdots button{width:9px;height:9px;border-radius:50%;border:0;padding:0;background:rgba(255,255,255,.4);cursor:pointer}
.hdots button.on{background:var(--gold);width:26px;border-radius:6px}
.avail{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.25);border-radius:30px;padding:8px 14px;font:12px system-ui;letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px;background:rgba(0,0,0,.35)}
.avail i{width:8px;height:8px;border-radius:50%;background:#3ddc84;animation:avp 2s ease-out infinite}
@keyframes avp{0%{box-shadow:0 0 0 0 rgba(61,220,132,.6)}100%{box-shadow:0 0 0 10px rgba(61,220,132,0)}}
.erow{display:flex;align-items:center;gap:16px;padding:22px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;transition:padding .3s}
.erow:first-of-type{border-top:1px solid var(--line)}
.erow:hover{padding-left:10px}
.erow .en{font:13px system-ui;color:var(--gold);letter-spacing:.15em;min-width:28px}
.erow .et{flex:1}
.erow h3{margin:0 0 4px;font:400 clamp(22px,5.5vw,34px)/1.15 Georgia,serif}
.erow p{margin:0;color:var(--mute);font-size:14px}
.erow .ep{font:13px system-ui;color:var(--gold);white-space:nowrap}
.erow .ar{font-size:22px;color:var(--mute)}
.tstrip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:12px;-webkit-overflow-scrolling:touch}
.tcard{flex:0 0 84%;max-width:420px;scroll-snap-align:start;border:1px solid var(--line);padding:22px;background:#080808}
.tcard p.q{font:400 18px/1.5 Georgia,serif;margin:0 0 16px}
.tcard .who{font:12px system-ui;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin:0}
`;

export default function Home() {
  const d = useSite(['event_types', 'testimonials', 'trusted_by', 'gallery', 'projects', 'faqs']);
  const [i, setI] = useState(0);

  const heroPics = d ? d.gallery.filter((g) => /^hero/i.test((g.category || '').trim())).map((g) => g.image_url) : [];
  const slides = d ? Array.from(new Set([d.c.hero_image, ...heroPics].filter(Boolean))) : [];

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, i]);

  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const show = slides.length > 0;
  const ticker = d.event_types.length ? d.event_types.map((t) => t.name) : ['Weddings', 'Naming ceremonies', 'Birthdays', 'Corporate events', 'Graduations'];
  const ig = [...d.gallery].filter((g) => !/^hero/i.test((g.category || '').trim())).reverse().slice(0, 6);
  const faqs = d.faqs.filter((f) => f.scope === 'events').slice(0, 6);

  return (
    <Shell c={c}>
      <style>{HOME_CSS}</style>

      <header className="hero" style={show ? { position: 'relative', overflow: 'hidden', backgroundImage: 'none', backgroundColor: '#000' } : {}}>
        {show && (
          <>
            <div className="hs" aria-hidden="true">
              {slides.map((u, k) => (
                <img key={u} src={u} alt="" className={k === i % slides.length ? 'on' : ''} loading={k === 0 ? 'eager' : 'lazy'} decoding="async" />
              ))}
            </div>
            {slides.length > 1 && (
              <div className="hdots">
                {slides.map((u, k) => (
                  <button key={u} aria-label={`Show photo ${k + 1}`} className={k === i % slides.length ? 'on' : ''} onClick={() => setI(k)} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="wrap">
          {c.availability_text && <span className="avail"><i />{c.availability_text}</span>}
          <p className="eyebrow">{c.studio_full_name}</p>
          <h1>{c.hero_title}</h1>
          <p>{c.hero_subtitle}</p>
          <Link className="btn" href="/events">Explore events</Link>{' '}
          <Link className="btn ghost" href="/projects">Our projects</Link>
        </div>
      </header>

      <Marquee items={ticker} />

      <section><div className="wrap">
        <Reveal>
          <p className="lbl">// {c.tagline || 'Who we are'}</p>
          <p className="stmt">{c.about_text}</p>
          <Link className="btn ghost" href="/about">Our story</Link>
        </Reveal>
      </div></section>

      {d.event_types.length > 0 && (
        <section><div className="wrap">
          <Reveal>
            <p className="lbl">// What we do</p>
            <h2 className="bigh">{c.events_title || 'Events'}</h2>
            {c.events_intro && <p className="mute" style={{ maxWidth: 640 }}>{c.events_intro}</p>}
          </Reveal>
          <div style={{ marginTop: 18 }}>
            {d.event_types.map((t, k) => (
              <Reveal key={t.id} delay={k * 60}>
                <Link className="erow" href="/events">
                  <span className="en">{String(k + 1).padStart(2, '0')}</span>
                  <span className="et"><h3>{t.name}</h3><p>{t.tagline}</p></span>
                  {t.starting_price ? <span className="ep">From {money(c, t.starting_price)}</span> : null}
                  <span className="ar">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p style={{ marginTop: 24 }}><Link className="btn" href="/events">See all events and packages</Link></p>
        </div></section>
      )}

      {d.projects.length > 0 && (
        <section><div className="wrap">
          <Reveal>
            <p className="lbl">// Selected work</p>
            <h2 className="bigh">Latest <em>projects</em></h2>
          </Reveal>
          <div className="pgrid">
            {d.projects.slice(0, 2).map((p, k) => (
              <Reveal key={p.id} delay={k * 100}>
                <Link href="/projects" className="pc">
                  {p.cover_image ? <img src={p.cover_image} alt={p.title} loading="lazy" /> : <div className="ph" />}
                  <h3>{p.title}</h3>
                  <span>{[p.category, p.year].filter(Boolean).join(' · ')}</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p><Link className="btn ghost" href="/projects">View all projects</Link></p>
        </div></section>
      )}

      {d.trusted_by.length > 0 && (
        <section><div className="wrap">
          <p className="lbl" style={{ textAlign: 'center' }}>// {c.trusted_title || 'Trusted by'}</p>
          <div className="trust">{d.trusted_by.map((t) => (
            t.logo_url ? <img key={t.id} src={t.logo_url} alt={t.name} loading="lazy" /> : <span key={t.id}>{t.name}</span>
          ))}</div>
        </div></section>
      )}

      {d.testimonials.length > 0 && (
        <section><div className="wrap">
          <Reveal>
            <p className="lbl">// Voices</p>
            <h2 className="bigh">{c.testimonials_title || 'Kind words'}</h2>
          </Reveal>
          <div className="tstrip">
            {d.testimonials.map((t) => (
              <div className="tcard" key={t.id}>
                {t.photo_url && <img className="avatar" src={t.photo_url} alt={t.client_name} loading="lazy" />}
                <p className="q">“{t.quote}”</p>
                <p className="who">{t.client_name}{t.client_role ? ' · ' + t.client_role : ''}</p>
              </div>
            ))}
          </div>
        </div></section>
      )}

      {faqs.length > 0 && (
        <section><div className="wrap" style={{ maxWidth: 800 }}>
          <Reveal>
            <p className="lbl">// Concerns</p>
            <h2 className="bigh">Frequently asked <em>questions</em></h2>
          </Reveal>
          {faqs.map((f) => <details key={f.id}><summary>{f.question}</summary><p className="mute">{f.answer}</p></details>)}
        </div></section>
      )}

      {c.instagram && ig.length > 0 && (
        <section><div className="wrap">
          <p className="lbl">// Follow along</p>
          <h2 className="bigh">{c.instagram_handle || 'Instagram'}</h2>
          <div className="igstrip">{ig.map((g) => (
            <a key={g.id} href={c.instagram} target="_blank" rel="noopener noreferrer"><img src={g.image_url} alt={g.caption || ''} loading="lazy" /></a>
          ))}</div>
          <a className="btn ghost" href={c.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
        </div></section>
      )}

      <Marquee big reverse items={['Let’s create something unforgettable']} />
      <div className="band">
        <Link className="btn" href="/events">Explore events</Link>{' '}
        {c.call_link && <a className="btn ghost" href={c.call_link} target="_blank" rel="noopener noreferrer">Free 15-minute call</a>}
      </div>
    </Shell>
  );
}
