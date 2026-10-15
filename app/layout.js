import './globals.css';
export const metadata = { title: 'F.O Studio', description: 'Photography, podcast and content studio' };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
