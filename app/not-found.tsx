'use client';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>404</h1>
            <p>Page Not Found</p>
          </div>
        </div>
      </body>
    </html>
  );
}
