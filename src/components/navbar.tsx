// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReloadLink } from './reloadLink';
import { useTranslation } from 'react-i18next';
import SwitchLanuageDropDown from './switchLanuageDropDown';

const navLinks = [
  { title: 'product', href: '/' },
  { title: 'about', href: '/about' },
  { title: 'updates', href: '/updates' }
];

type Locale = "en" | "fr" | "zh";

export default function Navbar({ lng } : {lng: Locale}) {
  const { t } = useTranslation();
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
    <div className='absolute w-full z-[20]'>
      {!isMobile ? (
        <nav className="items-center bg-background relative w-[95vw] px-5 mx-auto border border-grey border-t-0 rounded-b-2xl shadow-md">
          <div className="flex mx-auto items-center justify-between">
            <div className="inline flex-row pt-2">
                <ReloadLink reload={true} href={'/'+lng} router={router} className="inline-flex items-center justify-center text-primary font-nunito text-2xl sm:text-3xl lg:text-4xl cursor-pointer mr-8">
                    Examiniser
                </ReloadLink>
                
                <div className="inline-flex">
                {navLinks.map((link, index) => (
                    <div key={index} className="inline p-5 py-3">
                    <ReloadLink reload={false} href={'/'+lng+link.href} router={router} className="inline-flex p-1">
                        {t('navBar.'+link.title)}
                    </ReloadLink>
                    </div>
                ))}
                </div>
            </div>

            <div className='inline gap-6 space-x-4'>
              <SwitchLanuageDropDown current={lng}  />
              <button className='underline cursor-pointer' onClick={() => router.push('/'+lng+'/start')}>
                {t('navBar.Start-Creating')}
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
        <nav className="bg-background w-full">
          <div className="mx-auto flex justify-between items-center py-4 px-4">
            <div className="flex items-center justify-center text-primary font-nunito text-2xl sm:text-3xl lg:text-5xl cursor-pointer">Examiniser</div>
            <div className="flex justify-end items-center gap-6 text-white cursor-pointer">
              {/* Mobile nav actions */}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}