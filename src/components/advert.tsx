import { useEffect } from 'react';

interface AdSenseTestProps {
  slot: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

const Advert: React.FC<AdSenseTestProps> = ({ slot }) => {

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  if (process.env.NODE_ENV === 'development') {
    return <div className='text-center p-[20px]' style={{ backgroundColor: '#eee'}}>Ad placeholder (development mode)</div>;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx" // Replace with your AdSense publisher ID
      data-ad-slot={slot}
      data-ad-format="auto"
      data-adtest="on" // IMPORTANT: this ensures test ads only
    />
  );
};

export default Advert;
