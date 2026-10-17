import './globals.css';

const SITE = 'https://fatusiolamilekanphotography.com';
const SB = 'https://eplbpnkzueunbqlsrokc.supabase.co';
const KEY = 'sb_publishable_pJ-lKsoQD_EHRrByLgt7pw_S5YzgEF1';

async function getImage() {
  try {
    const r = await fetch(`${SB}/rest/v1/site_settings?key=in.(hero_image,logo_url)&select=key,value`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      next: { revalidate: 300 },
    });
    const rows = await r.json();
    const get = (k) => (rows.find((x) => x.key === k) || {}).value;
    return get('hero_image') || get('logo_url') || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata() {
  const title = 'Fatusi Olamilekan Photography';
  const description = 'Photography for every moment. Studio sessions, podcasts, content creation and events in Abuja.';
  const img = await getImage();
  return {
    metadataBase: new URL(SITE),
    title: { default: title + ' | Studio & Events in Abuja', template: '%s | ' + title },
    description,
    openGraph: {
      title,
      description,
      url: SITE,
      siteName: title,
      type: 'website',
      locale: 'en_NG',
      images: img ? [{ url: img }] : [],
    },
    twitter: {
      card: img ? 'summary_large_image' : 'summary',
      title,
      description,
      images: img ? [img] : [],
    },
  };
}

export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
