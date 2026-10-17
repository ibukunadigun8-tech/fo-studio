'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSite, Shell } from '../../lib/data';

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [i]);
  const g = items[i];
  return (
    <div className="lb"
      onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - sx.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <span className="lbcount">{i + 1} / {n}</span>
      <button className="lbx" aria-label="Close" onClick={onClose}>✕</button>
      <button className="lbn l" aria-label="Previous" onClick={() => go(-1)}>‹</button>
      <img src={g.image_url} alt={g.caption || ''} />
      <button className="lbn r" aria-label="Next" onClick={() => go(1)}>›</button>
      <div className="lbcap">{g.caption}</div>
    </div>
  );
}

export default function Portfolio() {
  const d = useSite(['gallery']);
  const [cat, setCat] = useState('All');
  const [idx, setIdx] = useState(null);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const cats = ['All', ...Array.from(new Set(d.gallery.map((g) => (g.category || '').trim()).filter(Boolean)))];
  const items = d.gallery.filter((g) => cat === 'All' || (g.category || '').trim() === cat);
  return (
    <Shell c={d.c}>
      <div className="wrap pg">
        <p className="eyebrow">Our work</p>
        <h1>Portfolio</h1>
        {d.gallery.length === 0 ? (
          <p className="mute">Photos coming soon.</p>
        ) : (
          <>
            {cats.length > 2 && (
              <div className="pills">
                {cats.map((x) => (
                  <button key={x} className={'pill' + (cat === x ? ' on' : '')} onClick={() => setCat(x)}>{x}</button>
                ))}
              </div>
            )}
            <div className="pfgrid">
              {items.map((g, i) => (
                <button className="pfitem" key={g.id} onClick={() => setIdx(i)} aria-label={g.caption || 'Open photo'}>
                  <img src={g.image_url} alt={g.caption || ''} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </>
        )}
        <p style={{ marginTop: 40 }}>
          <Link className="btn" href="/spaces">Explore the studio</Link>{' '}
          <Link className="btn ghost" href="/events">Explore events</Link>
        </p>
      </div>
      {idx !== null && items[idx] && <Lightbox items={items} i={idx} setI={setIdx} onClose={() => setIdx(null)} />}
    </Shell>
  );
}
