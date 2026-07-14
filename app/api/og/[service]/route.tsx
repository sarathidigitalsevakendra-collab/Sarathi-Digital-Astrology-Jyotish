import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  { params }: { params: { service: string } }
) {
  try {
    const serviceMap: Record<string, { en: string; hi: string }> = {
      'aadhaar-pan-voter': { en: 'Aadhaar / PAN / Voter ID', hi: 'आधार / पैन / वोटर आईडी' },
      'caste-income-domicile': { en: 'Certificates & Affidavits', hi: 'जाति / आय प्रमाण पत्र' },
      'irctc-train-tickets': { en: 'IRCTC Train & Tatkal Tickets', hi: 'ट्रेन और तत्काल टिकट' },
      'gst-msme-udyam': { en: 'GST & MSME Udyam', hi: 'जीएसटी पंजीकरण' },
      'astrology': { en: 'Jyotishya Astrology Services', hi: 'ज्योतिष सेवाएँ' }
    };

    const serviceInfo = serviceMap[params.service] || { 
      en: 'Government & Digital Services', 
      hi: 'सरकारी और डिजिटल सेवाएँ' 
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(to bottom right, #4c1d95, #c2410c)',
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '10px 24px',
              borderRadius: '9999px',
              marginBottom: '20px',
              color: '#fdba74',
              fontSize: '24px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Sarathi Digital Seva Kendra
          </div>

          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '20px',
              maxWidth: '900px',
            }}
          >
            {serviceInfo.en}
          </h1>

          <h2
            style={{
              fontSize: '48px',
              fontWeight: 600,
              color: '#fcd34d',
              marginBottom: '40px',
            }}
          >
            {serviceInfo.hi}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
              color: '#e2e8f0',
              fontSize: '24px',
            }}
          >
            <div style={{ display: 'flex', marginRight: '40px' }}>
              📍 Shop No.14, Rashmi Laxmi, Bhayandar East
            </div>
            <div style={{ display: 'flex' }}>
              📞 +91 83697 04457
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
