// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const Custom404: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <div 
        className="w-screen h-screen flex items-center justify-center text-primary"
        style={
          {
            '--color': '#E1E1E1',
            backgroundImage: `linear-gradient(0deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, var(--color) 25%, var(--color) 26%, transparent 27%, transparent 74%, var(--color) 75%, var(--color) 76%, transparent 77%, transparent)`,
            backgroundSize: '60px 60px',
          } as React.CSSProperties
        }
      >
        <div className='flex flex-col items-center justify-center'>
          <h1 className='text-6xl'>404</h1>
          <h2 className='text-2xl'>Woah, what page did you try to find?</h2>
        </div>
      </div>
    </>
  );
};

export default Custom404;
