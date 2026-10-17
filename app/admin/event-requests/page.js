'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import '../../site.css';

const STATUSES = ['new', 'call_booked', 'deposit_paid', 'confirmed', 'declined', 'completed'];
const n = (x) => Number(x || 0).toLocaleString();

export default function EventRequests() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await supabase.from('event_requests').select('*').order('created_at', { ascending: false }); setRows(data || []); };
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) load(); }); }, []);
  if (session === undefined) return <div className="load">…</div>;
  if (!session) return <div className="adm"><h2>Please log in first</h2><a className="btn" href="/admin">Go to admin login</a></div>;
  const setStatus = async (id, status) => { await supabase.from('event_requests').update({ status }).eq('id', id); load(); };
  const del = async (id) => { if (confirm('Delete this request?')) { await supabase.from('event_requests').delete().eq('id', id); load(); } };
  return (<div className="adm">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>Event requests ({rows.length})</h2><a className="btn ghost" href="/admin">← Admin</a></div>
    {rows.map((r) => (<div className="row" key={r.id}>
      <h4>{r.ref_code} · {r.event_type_name} · {r.package_name} · {r.event_date}</h4>
      <p>{r.customer_name} · <a href={`mailto:${r.customer_email}`}>{r.customer_email}</a> · <a href={`https://wa.me/${(r.customer_phone || '').replace(/\D/g, '')}`}>{r.customer_phone}</a></p>
      <p className="mute">{r.start_time && r.start_time + ' · '}{r.venue}{r.city && ', ' + r.city}{r.guests ? ' · ' + r.guests + ' guests' : ''}</p>
      {r.addons && <p className="mute">Add-ons: {r.addons}</p>}
      {r.notes && <p className="mute">Notes: {r.notes}</p>}
      <p>{r.estimated_total != null ? `Estimated: ${n(r.estimated_total)} · Deposit: ${n(r.deposit_due)}` : 'Custom quote needed'}</p>
      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>{' '}
      <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
    </div>))}
    {rows.length === 0 && <p className="mute">No event requests yet.</p>}
  </div>);
}
