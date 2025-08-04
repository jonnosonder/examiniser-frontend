import { useEffect, useRef } from 'react';

interface AdSenseTestProps {
  slot: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

const Advert: React.FC<AdSenseTestProps> = ({ slot }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', 'ca-pub-6195862060195022');
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    ins.setAttribute('data-adtest', 'true'); // testing only

    containerRef.current.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  if (process.env.NODE_ENV === 'development') {
    return <div className='text-center p-[20px]' style={{ backgroundColor: '#eee'}}>Ad placeholder (development mode)</div>;
  }

  return <div><div ref={containerRef} /></div>;
};

export default Advert;
