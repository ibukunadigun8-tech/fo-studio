'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite, Shell, Reveal } from '../../lib/data';

const PJ_CSS = `
.pj{position:fixed;inset:0;z-index:100;background:#000;overflow-y:auto}
.pjx{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:14px;z-index:101;width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:20px;cursor:pointer}
.pjin{max-width:760px;margin:0 auto;padding:calc(70px + env(safe-area-inset-top,0px)) 20px 60px}
.pjin img{width:100%;height:auto;display:block;margin:0 0 10px}
.pcbtn{background:none;border:0;padding:0;text-align:left;color:inherit;cursor:pointer;width:100%}
`;

export default function Projects() {
  const d = useSite(['projects']);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const cur = d.projects.find((p) => p.id === open);
  return (
    <Shell c={c}>
      <style>{PJ_CSS}</style>
      <div className="wrap pg">
        <p className="lbl">// Selected work</p>
        <h1>Projects</h1>
        {d.projects.length === 0 ? (
          <p className="mute">Stories coming soon.</p>
        ) : (
          <div className="pgrid">
            {d.projects.map((p, k) => (
              <Reveal key={p.id} delay={k * 80}>
                <button className="pcbtn" onClick={() => setOpen(p.id)}>
                  <div className="pc">
                    {p.cover_image ? <img src={p.cover_image} alt={p.title} loading="lazy" /> : <div className="ph" />}
                    <h3>{p.title}</h3>
                    <span>{[p.category, p.year].filter(Boolean).join(' · ')}</span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        )}
        <p style={{ marginTop: 40 }}>
          <Link className="btn" href="/events">Explore events</Link>{' '}
          <Link className="btn ghost" href="/portfolio">All photos</Link>
        </p>
      </div>

      {cur && (
        <div className="pj" role="dialog" aria-label={cur.title}>
          <button className="pjx" aria-label="Close" onClick={() => setOpen(null)}>✕</button>
          <div className="pjin">
            <p className="lbl">// {[cur.category, cur.year].filter(Boolean).join(' · ')}</p>
            <h1>{cur.title}</h1>
            {cur.story && <p className="mute" style={{ fontSize: 18, whiteSpace: 'pre-line', marginBottom: 24 }}>{cur.story}</p>}
            {cur.cover_image && <img src={cur.cover_image} alt={cur.title} />}
            {(cur.images || []).map((u) => <img key={u} src={u} alt="" loading="lazy" />)}
            <p style={{ marginTop: 30 }}><Link className="btn" href="/events">Planning something similar?</Link></p>
          </div>
        </div>
      )}
    </Shell>
  );
}
