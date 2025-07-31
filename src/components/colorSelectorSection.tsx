// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReinventedColorWheel from 'reinvented-color-wheel';
import 'reinvented-color-wheel/css/reinvented-color-wheel.min.css';

type ColorSelectorSectionProps = {
  onClose: () => void;
  passColorValue: React.Dispatch<React.SetStateAction<string>>;
  startingColor: string;
};

const ColorSelectorSection: React.FC<ColorSelectorSectionProps> = ({ onClose, passColorValue, startingColor }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(startingColor);
  const colorWheelRef = useRef<ReinventedColorWheel | null>(null);

  useEffect(() => {
    if (!containerRef.current || colorWheelRef.current) return;

    const wheel = new ReinventedColorWheel({
      appendTo: containerRef.current,
      wheelDiameter: 200,
      wheelThickness: 20,
      handleDiameter: 20,
      wheelReflectsSaturation: false,
      hex: startingColor,
      
    });

    colorWheelRef.current = wheel;

    wheel.onChange = (color: { hex: string }) => {
      setSelectedColor(color.hex);
      passColorValue(color.hex);
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-2 space-y-6 z-[1000] bg-white border-2 border-primary rounded-lg">
      <div className='flex w-full items-center justify-between'>
        <h2 className="text-xl font-semibold m-0 ">Select a Color</h2>
        <button className='p-2 m-0 ' onClick={onClose}>
          <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
        </button>
      </div>
      

      {/* Color Wheel Mount Point */}
      <div ref={containerRef} className="relative p-2" />

      {/* Color Preview */}
      <div className="text-center">
        <p className="text-sm mb-2">Selected Color: <strong>{selectedColor}</strong></p>
        <div
          className="w-12 h-12 rounded-full border border-gray-300 shadow-md"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
    </div>
  );
}

export default ColorSelectorSection;