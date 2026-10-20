'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/portfolio'); }, []);
  return <div className="load">…</div>;
}
