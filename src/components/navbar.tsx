"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const navLinks = [
  { title: 'Product', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Contact', href: '/contact' }
];

export default function Navbar() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='absolute w-full'>
      {!isMobile ? (
        <nav className="items-center bg-background relative w-[90vw] mx-auto">
          <div className="flex mx-auto items-center justify-between">
            <div className="flex flex-row">
                <a href="/" className="inline-flex items-center justify-center text-primary font-bold text-[2rem] cursor-pointer mr-8">
                    Examiniser
                </a>
                
                <div className="flex flex-row">
                {navLinks.map((link, index) => (
                    <div key={index} className="p-5">
                    <a href={link.href} className="inline-flex p-1">
                        {link.title}
                    </a>
                    </div>
                ))}
                </div>
            </div>

            <div className='flex gap-6'>
              <button className='underline cursor-pointer' onClick={() => router.push('/create')}>
                Start Creating
              </button>
              {/*
              <button className='loginBtn' onClick={() => router.push('/login')}>
                <span className="loginBtnSpan">Log in</span>
              </button>
              <button className='signupBtn' onClick={() => router.push('/signup')}>Join</button>
              */}
            </div>
          </div>
        </nav>
      ) : (
        <nav className="bg-background">
          <div className="mx-auto flex justify-between items-center py-4 px-4">
            <div className="flex items-center justify-center text-primary font-bold text-[6vw] cursor-pointer">Examiniser</div>
            <div className="flex justify-end items-center gap-6 text-white cursor-pointer">
              {/* Mobile nav actions */}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}