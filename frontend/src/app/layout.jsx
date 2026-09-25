import '../styles/globals.css';

export const metadata = {
  title: 'FleetCore Enterprise - Industrial Fleet Operating System',
  description: 'Global Fleet Management, Real-Time IoT Telemetry, and ELD Compliance',
  themeColor: '#111417',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#111417', color: '#F5F7F8', colorScheme: 'dark' }}>
      <body style={{
        backgroundColor: '#111417',
        color: '#F5F7F8',
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        colorScheme: 'dark',
        fontFamily: "'Geist', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}

