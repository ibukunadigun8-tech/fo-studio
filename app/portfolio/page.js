'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSite, Shell, Reveal, ExpandingCards } from '../../lib/data';

const PF_CSS = `
.pills{display:flex;gap:8px;overflow-x:auto;padding:4px 0 14px;margin-top:16px}
.pill{white-space:nowrap;background:none;color:var(--mute);border:1px solid var(--line);padding:9px 16px;border-radius:30px;font:12px system-ui;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.pill.on{background:var(--gold);color:#000;border-color:var(--gold)}
.pfgrid{columns:2;column-gap:8px}
@media(min-width:760px){.pfgrid{columns:3;column-gap:12px}}
.pfitem{display:block;width:100%;padding:0;border:0;background:#111;margin:0 0 8px;break-inside:avoid;cursor:zoom-in;overflow:hidden;border-radius:12px}
.pfitem img{width:100%;height:auto;display:block}
.pcbtn{background:none;border:0;padding:0;text-align:left;color:inherit;cursor:pointer;width:100%;font:inherit}
.pj{position:fixed;inset:0;z-index:100;background:#000;overflow-y:auto;-webkit-overflow-scrolling:touch}
.pjx{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));right:14px;z-index:101;width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:20px;cursor:pointer}
.pjin{max-width:760px;margin:0 auto;padding:calc(70px + env(safe-area-inset-top,0px)) 20px 60px}
.pjimg{display:block;width:100%;padding:0;border:0;background:none;margin:0 0 10px;cursor:zoom-in}
.pjimg img{width:100%;height:auto;display:block;border-radius:12px}
.lb{position:fixed;inset:0;z-index:130;background:rgba(0,0,0,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:pan-y}
.lb img{max-width:100%;max-height:78vh;object-fit:contain;display:block}
.lbcap{color:var(--mute);font:14px system-ui;text-align:center;padding:14px 60px 0;min-height:44px}
.lbcount{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:20px;color:var(--mute);font:13px system-ui;letter-spacing:.15em}
.lbx,.lbn{position:absolute;background:rgba(255,255,255,.1);color:#fff;border:0;border-radius:50%;width:46px;height:46px;font-size:22px;cursor:pointer}
.lbx{top:calc(12px + env(safe-area-inset-top,0px));right:14px}
.lbn.l{left:8px;top:50%}.lbn.r{right:8px;top:50%}
@media(max-width:600px){.lbn{display:none}}
`;

function Lightbox({ items, i, setI, onClose }) {
  const sx = useRef(0);
  const n = items.length;
  const go = (dir) => setI((i + dir + n) % n);
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [i, n]);
  const g = items[i];
  if (!g) return null;
  return (
    <div className="lb" role="dialog" aria-label="Photo viewer"
      onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <span className="lbcount">{i + 1} / {n}</span>
      <button className="lbx" aria-label="Close photo" onClick={onClose}>✕</button>
      {n > 1 && <button className="lbn l" aria-label="Previous photo" onClick={() => go(-1)}>‹</button>}
      <img src={g.url} alt={g.caption || ''} />
      {n > 1 && <button className="lbn r" aria-label="Next photo" onClick={() => go(1)}>›</button>}
      <div className="lbcap">{g.caption}</div>
    </div>
  );
}

export default function Portfolio() {
  const d = useSite(['projects', 'gallery']);
  const [pcat, setPcat] = useState('All');
  const [gcat, setGcat] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [lb, setLb] = useState(null);

  useEffect(() => {
    document.body.style.overflow = openId || lb ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [openId, lb]);

  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;

  const projCats = ['All', ...Array.from(new Set(d.projects.map((p) => (p.category || '').trim()).filter(Boolean)))];
  const projects = d.projects.filter((p) => pcat === 'All' || (p.category || '').trim() === pcat);

  const lib = d.gallery.filter((g) => !/^(hero|behind)/i.test((g.category || '').trim()));
  const libCats = ['All', ...Array.from(new Set(lib.map((g) => (g.category || '').trim()).filter(Boolean)))];
  const photos = lib.filter((g) => gcat === 'All' || (g.category || '').trim() === gcat);

  const cur = d.projects.find((p) => p.id === openId);
  const curPics = cur ? [cur.cover_image, ...(cur.images || [])].filter(Boolean).map((u) => ({ url: u, caption: cur.title })) : [];

  return (
    <Shell c={c}>
      <style>{PF_CSS}</style>
      <div className="wrap pg">
        <p className="lbl">// Our work</p>
        <h1>Portfolio</h1>

        {d.projects.length === 0 && lib.length === 0 && <p className="mute">Work coming soon.</p>}

        {d.projects.length > 0 && (
          <>
            {projCats.length > 2 && (
              <div className="pills">
                {projCats.map((x) => <button key={x} className={'pill' + (pcat === x ? ' on' : '')} onClick={() => setPcat(x)}>{x}</button>)}
              </div>
            )}
            {projects.length > 0 && projects.length <= 7 ? (
              <div style={{ marginTop: 18 }}>
                <ExpandingCards items={projects.map((p) => ({
                  id: p.id, img: p.cover_image, title: p.title,
                  text: [p.category, p.year].filter(Boolean).join(' · '),
                  onOpen: () => setOpenId(p.id), cta: 'View project',
                }))} />
              </div>
            ) : (
              <div className="pgrid" style={{ marginTop: 18 }}>
                {projects.map((p, k) => (
                  <Reveal key={p.id} delay={k * 70}>
                    <button className="pcbtn" onClick={() => setOpenId(p.id)} aria-label={'Open ' + p.title}>
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
          </>
        )}

        {lib.length > 0 && (
          <>
            <h2 style={{ marginTop: d.projects.length ? 36 : 20 }}>{d.projects.length ? 'More photos' : 'Photos'}</h2>
            {libCats.length > 2 && (
              <div className="pills">
                {libCats.map((x) => <button key={x} className={'pill' + (gcat === x ? ' on' : '')} onClick={() => setGcat(x)}>{x}</button>)}
              </div>
            )}
            <div className="pfgrid">
              {photos.map((g, i) => (
                <button className="pfitem" key={g.id} aria-label={g.caption || 'Open photo'}
                  onClick={() => setLb({ items: photos.map((x) => ({ url: x.image_url, caption: x.caption })), i })}>
                  <img src={g.image_url} alt={g.caption || ''} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="btnrow" style={{ marginTop: 40 }}>
          <Link className="btn" href="/events">Explore events</Link>
          <Link className="btn ghost" href="/gallery">Client gallery</Link>
        </div>
      </div>

      {cur && (
        <div className="pj" role="dialog" aria-label={cur.title}>
          <button className="pjx" aria-label="Close project" onClick={() => setOpenId(null)}>✕</button>
          <div className="pjin">
            <p className="lbl">// {[cur.category, cur.year].filter(Boolean).join(' · ')}</p>
            <h1>{cur.title}</h1>
            {cur.story && <p className="mute" style={{ fontSize: 18, whiteSpace: 'pre-line', marginBottom: 24 }}>{cur.story}</p>}
            {curPics.map((p, i) => (
              <button className="pjimg" key={p.url + i} aria-label="View photo" onClick={() => setLb({ items: curPics, i })}>
                <img src={p.url} alt="" loading="lazy" />
              </button>
            ))}
            <div className="btnrow" style={{ marginTop: 30 }}>
              <Link className="btn" href="/events">Planning something similar?</Link>
            </div>
          </div>
        </div>
      )}

      {lb && <Lightbox items={lb.items} i={lb.i} setI={(i) => setLb({ ...lb, i })} onClose={() => setLb(null)} />}
    </Shell>
  );
}
