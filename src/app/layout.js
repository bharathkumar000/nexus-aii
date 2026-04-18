import "./globals.css";

export const metadata = {
  title: "NEXUS.AI | Elite Threat Intelligence",
  description: "Advanced AI-Driven Threat Detection & Simulation Engine",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#e8eaed', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
