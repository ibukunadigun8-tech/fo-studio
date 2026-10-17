'use client';
import { useEffect, useState } from 'react';
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

const ICONS = {
  events: '<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>',
  spaces: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  services: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  portfolio: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  book: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  collapse: '<path d="M11 7l-5 5 5 5M18 7l-5 5 5 5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
};

function Icon({ n, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[n] }} />
  );
}

const EXPLORE = [['Home', '/', 'home'], ['Spaces', '/spaces', 'spaces'], ['Events', '/events', 'events'], ['Services', '/services', 'services'], ['Portfolio', '/portfolio', 'portfolio']];
const STUDIO = [['About', '/about', 'about'], ['Contact', '/contact', 'contact']];

export function Shell({ c, children }) {
  const path = usePathname() || '/';
  const [col, setCol] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <div className={'app' + (col ? ' col' : '') + (open ? ' open' : '')}>
      <div className="mbar">
        <button className="sbtn" aria-label="Open menu" onClick={() => setOpen(true)}><Icon n="menu" /></button>
        <Link href="/" className="mbrand">
          {c.logo_url && <img src={c.logo_url} alt="" style={{ height: 32, width: 'auto' }} />}
          <span className="sname">{c.studio_name}</span>
        </Link>
        <Link className="btn sm" href="/book" style={{ marginLeft: 'auto' }}>Book</Link>
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
          <div className="slab">Studio</div>
          {STUDIO.map(Item)}
        </div>
        <div className="sfoot">
          <Link href="/book" className="sbook" title="Book a session">
            <Icon n="book" size={18} />
            <span className="sbooktxt">Book a session</span>
          </Link>
        </div>
      </aside>

      <div className="main">
        {children}
        <footer><div className="wrap">
          <p className="logo">{c.studio_full_name}</p>
          <p>{c.address} · {c.phone} · {c.email}</p>
          <p>{c.opening_hours}</p>
          <p>{c.footer_text}</p>
        </div></footer>
      </div>
    </div>
  );
}
