'use client';
import Link from 'next/link';
import { useSite, Shell, Reveal } from '../../lib/data';

export default function About() {
  const d = useSite(['faqs', 'gallery']);
  if (!d) return <div className="load">F.O STUDIO</div>;
  const { c } = d;
  const bts = d.gallery.filter((g) => /behind/i.test(g.category || ''));
  const faqs = d.faqs.filter((f) => (f.scope || 'general') === 'general');
  return (
    <Shell c={c}>
      <div className="wrap pg" style={{ maxWidth: 800 }}>
        <p className="lbl">// {c.tagline}</p>
        <h1>{c.about_title}</h1>
        {c.about_image && <img className="aboutimg" src={c.about_image} alt={c.studio_full_name} />}
        <Reveal><p className="mute" style={{ fontSize: 18, whiteSpace: 'pre-line' }}>{c.about_story || c.about_text}</p></Reveal>

        {bts.length > 0 && (
          <>
            <h2 style={{ marginTop: 40 }}>Behind the scenes</h2>
            <div className="igstrip">{bts.map((g) => <img key={g.id} src={g.image_url} alt={g.caption || ''} loading="lazy" />)}</div>
          </>
        )}

        {faqs.length > 0 && (
          <>
            <h2 style={{ marginTop: 40 }}>{c.faq_title}</h2>
            {faqs.map((f) => <details key={f.id}><summary>{f.question}</summary><p className="mute">{f.answer}</p></details>)}
          </>
        )}

        <div className="btnrow" style={{ marginTop: 40 }}>
          {c.instagram && <a className="btn ghost" href={c.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
          <Link className="btn" href="/events">Explore events</Link>
          <Link className="btn ghost" href="/portfolio">Our portfolio</Link>
        </div>
      </div>
    </Shell>
  );
}
