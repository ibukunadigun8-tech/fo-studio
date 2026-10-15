'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export function Shell({ c, children }) {
  const links = [['Spaces', '/spaces'], ['Services', '/services'], ['Portfolio', '/portfolio'], ['About', '/about'], ['Contact', '/contact']];
  return (
    <>
      <nav><div className="wrap bar">
        <Link href="/" className="logo">{c.logo_url ? <img src={c.logo_url} alt={c.studio_name} style={{ height: 38, display: 'block' }} /> : c.studio_name}</Link>
        <div className="links">{links.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}</div>
        <Link className="btn sm" href="/book">Book a session</Link>
      </div></nav>
      {children}
      <footer><div className="wrap">
        <p className="logo">{c.studio_full_name}</p>
        <p>{c.address} · {c.phone} · {c.email}</p>
        <p>{c.opening_hours}</p>
        <p>{c.footer_text}</p>
      </div></footer>
    </>
  );
}
