'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import '../../site.css';

export default function Requests() {
  const [session, setSession] = useState(undefined);
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false }); setRows(data || []); };
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) load(); }); }, []);
  if (session === undefined) return <div className="load">…</div>;
  if (!session) return <div className="adm"><h2>Please log in first</h2><a className="btn" href="/admin">Go to admin login</a></div>;
  const setStatus = async (id, status) => { await supabase.from('booking_requests').update({ status }).eq('id', id); load(); };
  const del = async (id) => { if (confirm('Delete this request?')) { await supabase.from('booking_requests').delete().eq('id', id); load(); } };
  return (<div className="adm">
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>Booking requests ({rows.length})</h2><a className="btn ghost" href="/admin">← Admin</a></div>
    {rows.map((r) => (<div className="row" key={r.id}>
      <h4>{r.ref_code} · {r.space_name} · {r.session_date} {r.start_time} ({r.hours}hr)</h4>
      <p>{r.customer_name} · <a href={`mailto:${r.customer_email}`}>{r.customer_email}</a> · <a href={`https://wa.me/${(r.customer_phone || '').replace(/\D/g, '')}`}>{r.customer_phone}</a></p>
      <p className="mute">{r.service} {r.notes && '· ' + r.notes}</p>
      <p>Estimated: {Number(r.estimated_total || 0).toLocaleString()}</p>
      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>{['new', 'contacted', 'confirmed', 'declined'].map((s) => <option key={s}>{s}</option>)}</select>
      <button className="btn danger" onClick={() => del(r.id)}>Delete</button>
    </div>))}
    {rows.length === 0 && <p className="mute">No requests yet.</p>}
  </div>);
}
