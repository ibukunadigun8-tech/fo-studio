'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from './supabase';
import '../app/site.css';

export function useSite(tables = []) {
  const [d, setD] = useState(null);
  useEffect(() => {
    (async () => {
      const names = ['site_settings', ...tables];
      const res = await Promise.all(names.map((t) => supabase.from(t).select('*').order('sort_order')));
      const c = {};
      (res[0].data || []).forEach((r) => (c[r.key] = r.value));
      const out = { c };
      tables.forEach((t, i) => (out[t] = res[i + 1].data || []));
      setD(out);
    })();
  }, []);
  return d;
}

export const money = (c, n) => (c.currency_symbol || '') + Number(n || 0).toLocaleString();

const SHELL_CSS = `
.rv{opacity:0;transform:translateY(28px);transition:opacity .9s ease,transform .9s ease}
.rv.in{opacity:1;transform:none}
.mq{overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 0;background:#000}
.mq-track{display:flex;width:max-content;animation:mqslide 30s linear infinite}
.mq.rev .mq-track{animation-direction:reverse}
.mq-row{display:flex;flex-shrink:0}
.mq-row span{font:500 13px system-ui;letter-spacing:.3em;text-transform:uppercase;color:var(--mute);padding:0 22px;white-space:nowrap}
.mq-row i{font-style:normal;color:var(--gold);margin-left:44px}
.mq.big{border:0;padding:34px 0}
.mq.big .mq-row span{font:400 clamp(40px,12vw,110px)/1 Georgia,serif;letter-spacing:0;text-transform:none;color:#fff}
@keyframes mqslide{to{transform:translateX(-50%)}}
.lbl{font:500 12px system-ui;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin:0 0 14px}
.bigh{font:400 clamp(34px,9vw,64px)/1.05 Georgia,serif;margin:0 0 22px}
.bigh em{font-style:italic;color:var(--gold)}
.stmt{font:400 clamp(22px,5.6vw,38px)/1.35 Georgia,serif;max-width:900px;margin:0 0 22px}
.pgrid{display:grid;gap:18px;grid-template-columns:1fr}
@media(min-width:760px){.pgrid{grid-template-columns:1fr 1fr}}
.pc{display:block;text-decoration:none;color:inherit;margin-bottom:18px}
.pc img,.pc .ph{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#111}
.pc h3{margin:12px 0 2px;font:400 24px Georgia,serif}
.pc span{font:12px system-ui;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.mq-track{animation:none}}
`;

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={'rv' + (on ? ' in' : '') + (className ? ' ' + className : '')} style={{ transitionDelay: delay + 'ms' }}>
      {children}
    </div>
  );
}

export function Marquee({ items, big = false, reverse = false }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  const row = (k) => (
    <div className="mq-row" key={k} aria-hidden={k > 0 ? 'true' : undefined}>
      {list.map((t, i) => <span key={i}>{t}<i>✦</i></span>)}
    </div>
  );
  return (
    <div className={'mq' + (big ? ' big' : '') + (reverse ? ' rev' : '')}>
      <div className="mq-track">{[0, 1, 2, 3].map(row)}</div>
    </div>
  );
}

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  events: '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
  projects: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  spaces: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  portfolio: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  collapse: '<path d="M11 7l-5 5 5 5M18 7l-5 5 5 5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.3A8.5 8.5 0 1 1 21 11.5z"/><path d="M9 8.5c.3 2.5 2.7 5 5.5 5.5l1.5-1.5-2-1-1 .7c-1-.5-1.8-1.3-2.3-2.3l.7-1-1-2z"/>',
};

function Icon({ n, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[n] }} />
  );
}

const EXPLORE = [['Home', '/', 'home'], ['Events', '/events', 'events'], ['Projects', '/projects', 'projects'], ['Portfolio', '/portfolio', 'portfolio']];
const MORE = [['The Studio', '/studio', 'spaces'], ['About', '/about', 'about'], ['Contact', '/contact', 'contact']];

export function Shell({ c, children }) {
  const path = usePathname() || '/';
  const [col, setCol] = useState(false);
  const [open, setOpen] = useState(false);
  const [y, setY] = useState(0);

  useEffect(() => {
    const f = () => setY(window.scrollY || 0);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    try { setCol(localStorage.getItem('fo-side-col') === '1'); } catch (e) {}
  }, []);
  useEffect(() => { setOpen(false); }, [path]);

  const toggle = () => {
    const n = !col;
    setCol(n);
    try { localStorage.setItem('fo-side-col', n ? '1' : '0'); } catch (e) {}
  };
  const is = (h) => (h === '/' ? path === '/' : path.startsWith(h));

  const Item = ([label, href, icon]) => (
    <Link key={href} href={href} title={label} className={'sitem' + (is(href) ? ' on' : '')}>
      <Icon n={icon} />
      <span className="slabel">{label}</span>
    </Link>
  );

  const p = Math.min(1, y / 180);
  const wa = c.whatsapp
    ? `https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(c.whatsapp_fab_text || 'Hello! I would like to enquire.')}`
    : null;

  return (
    <div className={'app' + (col ? ' col' : '') + (open ? ' open' : '')}>
      <style>{SHELL_CSS}</style>
      <div className="mbar">
        <button className="sbtn" aria-label="Open menu" onClick={() => setOpen(true)}><Icon n="menu" /></button>
        <Link href="/" className="mbrand">
          <span className="sname">{c.studio_name}</span>
        </Link>
      </div>
      <div className="scrim" onClick={() => setOpen(false)} />

      <aside className="side">
        <div className="shead">
          <Link href="/" className="sbrand">
            {c.logo_url && <img className="slogo" src={c.logo_url} alt={c.studio_name} />}
            <span className="sname">{c.studio_name}</span>
          </Link>
          <button className="sbtn stoggle" aria-label="Collapse or expand sidebar" onClick={toggle}><Icon n="collapse" size={18} /></button>
          <button className="sbtn sclose" aria-label="Close menu" onClick={() => setOpen(false)}><Icon n="close" size={18} /></button>
        </div>
        <div className="snav" role="navigation" aria-label="Main navigation">
          <div className="slab">Explore</div>
          {EXPLORE.map(Item)}
          <div className="slab">More</div>
          {MORE.map(Item)}
        </div>
      </aside>

      <div className="main">
        {path === '/' && (c.logo_wide_url || c.logo_url) && (
          <div className="logoband" style={{ paddingTop: 34 - 22 * p, paddingBottom: 10 - 6 * p }}>
            <img
              src={c.logo_wide_url || c.logo_url}
              alt={c.studio_name}
              style={{ maxHeight: 220 - 150 * p, opacity: 1 - 0.4 * p }}
            />
          </div>
        )}
        {children}
        <footer><div className="wrap">
          <p className="logo">{c.studio_full_name}</p>
          <p>{c.address} · {c.phone} · {c.email}</p>
          <p>{c.opening_hours}</p>
          <p>{c.footer_text}</p>
        </div></footer>
      </div>

      {wa && (
        <a className="wafab" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
          <Icon n="chat" size={28} />
        </a>
      )}
    </div>
  );
}
