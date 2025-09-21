// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReloadLink } from './reloadLink';
import { useTranslation } from 'react-i18next';
import SwitchLanuageDropDown from './switchLanuageDropDown';
import { Locale } from '@/lib/locales';
import "@/styles/navbar.css"

const navLinks = [
  { title: 'product', href: '/' },
  { title: 'about', href: '/about' },
  { title: 'updates', href: '/updates' }
];

export default function Navbar({ lng, pageOn } : {lng: Locale, pageOn:"/"|"/about"|"/updates"}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isBurgerActive, setIsBurgerActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      console.log(isBurgerActive);
      if (window.innerWidth > 768 && isBurgerActive) {
        setIsBurgerActive(false);
        console.log("removed the burger expanded");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isBurgerActive]);

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
                    <ReloadLink reload={false} href={'/'+lng+link.href} router={router} className="inline-flex p-1 pb-0">
                        {t('navBar.'+link.title)}
                    </ReloadLink>
                    {(link.href === pageOn) && (
                      <div className='w-full h-1 bg-accent rounded-full animate-fillX' />
                    )}
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
        <nav className="bg-background w-full border-b border-grey shadow-lg">
          <div className="mx-auto flex justify-between items-center py-2 px-4 relative">
            <div className="flex items-center justify-center text-primary font-nunito text-2xl sm:text-3xl lg:text-5xl cursor-pointer">Examiniser</div>
            <div className="flex w-full justify-end items-center gap-6 text-white cursor-pointer" />
            <SwitchLanuageDropDown current={lng}  />
            <>
              <div className={`circle ${isBurgerActive ? "expanded" : ""}`}></div>

              <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center flex-col fixed z-20">{isBurgerActive && (
                <div className="burgerItems">
                  <button 
                    className="burgerBtn"
                    onClick={() => {setIsBurgerActive(false)}}
                  >
                    <ReloadLink reload={false} href={'/'+lng+'/'} router={router} className="inline-flex p-1">
                        {t('navBar.'+'product')}
                    </ReloadLink>
                  </button>
                  <button 
                    className="burgerBtn"
                    onClick={() => {setIsBurgerActive(false)}}
                  >
                    <ReloadLink reload={false} href={'/'+lng+'/about'} router={router} className="inline-flex p-1">
                        {t('navBar.'+'about')}
                    </ReloadLink>
                  </button>
                  <button 
                    className="burgerBtn"
                    onClick={() => {setIsBurgerActive(false)}}
                  >
                    <ReloadLink reload={false} href={'/'+lng+'/updates'} router={router} className="inline-flex p-1">
                        {t('navBar.'+'updates')}
                    </ReloadLink>
                  </button>
                </div>
              )}</div>
              <div className='w-12 h-12 flex flex-shrink-0' />
              <div className='absolute w-12 h-12 flex flex-shrink-0 right-4'>
                <label className="hamburger" htmlFor="hamburger" id='hamburgerButton'>
                  <input
                    type="checkbox"
                    id="hamburger"
                    checked={isBurgerActive}
                    onChange={() => {setIsBurgerActive(!isBurgerActive)}}
                  />
                  <svg className='ease-custom w-full h-full' viewBox="0 0 32 32">
                  <path
                    className="line line-top-bottom"
                    d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                  ></path>
                  <path className="line" d="M7 16 27 16"></path>
                  </svg>
                </label>
              </div>
            </>
          </div>
        </nav>
      )}
    </div>
  );
}