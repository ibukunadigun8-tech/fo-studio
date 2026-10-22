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
export const pricesOn = (c) => String((c && c.show_prices) || 'yes').trim().toLowerCase() !== 'no';
export const priceText = (c, n) => (pricesOn(c) && Number(n) > 0 ? money(c, n) : '');

const SHELL_CSS = `
.wrap.pg{padding-left:20px;padding-right:20px}
.pg{padding-top:36px;padding-bottom:40px}
.btnrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
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
.trust{display:flex;flex-wrap:wrap;gap:22px 34px;align-items:center;justify-content:center}
.trust img{height:34px;width:auto;filter:grayscale(1) brightness(1.6);opacity:.85}
.trust span{font:13px system-ui;letter-spacing:.2em;text-transform:uppercase;color:var(--mute)}
.avatar{width:52px;height:52px;border-radius:50%;object-fit:cover;margin-bottom:10px;display:block}
.igstrip{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:16px 0}
.igstrip img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.aboutimg{width:100%;max-width:420px;display:block;margin:0 0 24px}
.xc{display:grid;gap:8px;width:100%;margin:0;padding:0;list-style:none;transition:grid-template-columns .5s ease,grid-template-rows .5s ease}
.xci{position:relative;overflow:hidden;border-radius:14px;border:1px solid var(--line);background:#0b0b0b;cursor:pointer;min-width:0;min-height:0}
.xci img,.xcph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1);transform:scale(1.1);transition:filter .5s ease,transform .5s ease}
.xcph{background:linear-gradient(135deg,#1c1c1c,#050505)}
.xci.on img{filter:none;transform:scale(1)}
.xcshade{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88),rgba(0,0,0,.4) 50%,rgba(0,0,0,.05))}
.xcside{position:absolute;left:16px;right:16px;bottom:14px;z-index:2;font:500 12px system-ui;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity .3s ease}
.xci.on .xcside{opacity:0}
.xcbody{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:20px;pointer-events:none}
.xci.on .xcbody{pointer-events:auto}
.xct,.xcp,.xcprice,.xcbody .btn{opacity:0;transform:translateY(8px);transition:opacity .35s ease .15s,transform .35s ease .15s}
.xci.on .xct,.xci.on .xcp,.xci.on .xcprice,.xci.on .xcbody .btn{opacity:1;transform:none}
.xct{margin:0;font:400 clamp(22px,4vw,30px)/1.15 Georgia,serif;color:#fff}
.xcp{margin:0;font-size:14px;color:rgba(255,255,255,.85);max-width:320px}
.xcprice{margin:0;color:var(--gold);font:600 13px system-ui;letter-spacing:.1em}
.xcbody .btn{align-self:flex-start;margin-top:4px}
@media(min-width:768px){.xcside{left:50%;right:auto;bottom:18px;max-height:calc(100% - 36px);transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl}}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.mq-track{animation:none}.xc,.xci img{transition:none}}
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

export function ExpandingCards({ items, defaultActive = 0 }) {
  const [active, setActive] = useState(defaultActive);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const f = () => setWide(window.innerWidth >= 768);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  if (!items || !items.length) return null;
  const a = Math.min(active, items.length - 1);
  const track = items.map((_, i) => (i === a ? '5fr' : '1fr')).join(' ');
  const style = wide
    ? { gridTemplateColumns: track, gridTemplateRows: '1fr', height: 500 }
    : { gridTemplateRows: track, gridTemplateColumns: '1fr', height: 600 };
  return (
    <ul className="xc" style={style}>
      {items.map((it, i) => (
        <li key={it.id} className={'xci' + (i === a ? ' on' : '')} tabIndex={0}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}>
          {it.img ? <img src={it.img} alt={it.title} loading="lazy" decoding="async" /> : <div className="xcph" />}
          <div className="xcshade" />
          <span className="xcside">{it.title}</span>
          <div className="xcbody">
            <h3 className="xct">{it.title}</h3>
            {it.text ? <p className="xcp">{it.text}</p> : null}
            {it.price ? <p className="xcprice">{it.price}</p> : null}
            {it.href ? <Link href={it.href} className="btn sm">{it.cta || 'View'}</Link> : null}
            {it.onOpen ? <button className="btn sm" onClick={(e) => { e.stopPropagation(); it.onOpen(); }}>{it.cta || 'View'}</button> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  events: '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
  spaces: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  portfolio: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
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

const EXPLORE = [['Home', '/', 'home'], ['Events', '/events', 'events'], ['Portfolio', '/portfolio', 'portfolio']];
const MORE = [['The Studio', '/studio', 'spaces'], ['Client Gallery', '/gallery', 'lock'], ['About', '/about', 'about'], ['Contact', '/contact', 'contact']];

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

const LAP_CSS = `
.lapv{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:pan-y}
.lapv img{max-width:100%;max-height:80vh;object-fit:contain;display:block}
.lapc{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:20px;color:var(--mute);font:13px system-ui;letter-spacing:.15em}
.lapx,.lapn{position:absolute;background:rgba(255,255,255,.12);color:#fff;border:0;border-radius:50%;width:46px;height:46px;font-size:22px;cursor:pointer}
.lapx{top:calc(12px + env(safe-area-inset-top,0px));right:14px}
.lapn.l{left:8px;top:50%}.lapn.r{right:8px;top:50%}
@media(max-width:600px){.lapn{display:none}}
.lapnav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;font:12px system-ui;letter-spacing:.12em;text-transform:uppercase;color:var(--mute)}
`;

export function LapGallery({ photos, onOpen, perPage = 6, label = 'Photo' }) {
  const [page, setPage] = useState(0);
  const [view, setView] = useState(null);
  const sx = useRef(0);
  const n = (photos || []).length;

  useEffect(() => {
    document.body.style.overflow = view !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [view]);

  useEffect(() => {
    if (view === null) return;
    const k = (e) => {
      if (e.key === 'Escape') setView(null);
      if (e.key === 'ArrowRight') setView((v) => (v + 1) % n);
      if (e.key === 'ArrowLeft') setView((v) => (v - 1 + n) % n);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [view, n]);

  if (!n) return null;
  const pages = Math.ceil(n / perPage);
  const pg = Math.min(page, pages - 1);
  const start = pg * perPage;
  const open = (i) => (onOpen ? onOpen(i) : setView(i));
  const go = (dir) => setView((v) => (v + dir + n) % n);

  return (
    <div>
      <style>{LAP_CSS}</style>
      <ExpandingCards key={pg} items={photos.slice(start, start + perPage).map((ph, i) => ({
        id: start + i, img: ph.thumb || ph.url, title: ph.caption || `${label} ${start + i + 1}`,
        onOpen: () => open(start + i), cta: 'View photo',
      }))} />
      {pages > 1 && (
        <div className="lapnav">
          <button type="button" className="btn ghost sm" disabled={pg === 0} style={{ opacity: pg === 0 ? 0.35 : 1 }} onClick={() => setPage(pg - 1)}>← Previous</button>
          <span>{start + 1}–{Math.min(start + perPage, n)} of {n}</span>
          <button type="button" className="btn ghost sm" disabled={pg >= pages - 1} style={{ opacity: pg >= pages - 1 ? 0.35 : 1 }} onClick={() => setPage(pg + 1)}>Next →</button>
        </div>
      )}
      {view !== null && photos[view] && (
        <div className="lapv" role="dialog" aria-label="Photo viewer"
          onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
          <span className="lapc">{view + 1} / {n}</span>
          <button className="lapx" aria-label="Close photo" onClick={() => setView(null)}>✕</button>
          {n > 1 && <button className="lapn l" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>}
          <img src={photos[view].url} alt={photos[view].caption || ''} />
          {n > 1 && <button className="lapn r" aria-label="Next photo" onClick={() => go(1)}>›</button>}
        </div>
      )}
    </div>
  );
}
