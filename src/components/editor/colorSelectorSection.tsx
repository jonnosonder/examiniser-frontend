// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { addHexToRecent, defaultColors, recentColors } from '@/lib/colorData';
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
  const [selectedColor, setSelectedColor] = useState(startingColor || '#FFFFFF');
  const colorWheelRef = useRef<ReinventedColorWheel | null>(null);
  const isUpdatingFromInput = useRef(false);

  useEffect(() => {
    if (!containerRef.current || colorWheelRef.current) return;

    const wheel = new ReinventedColorWheel({
      appendTo: containerRef.current,
      wheelDiameter: 200,
      wheelThickness: 20,
      handleDiameter: 20,
      wheelReflectsSaturation: false,
      hex: startingColor || '#FFFFFF',
    });

    colorWheelRef.current = wheel;

    wheel.onChange = (color: { hex: string }) => {
      if (!isUpdatingFromInput.current) {
        setSelectedColor(color.hex.toUpperCase());
        passColorValue(color.hex.toUpperCase());
      }
    };
  }, []);

  useEffect(() => {
    if (colorWheelRef.current) {
      colorWheelRef.current.hex = startingColor
    }
  }, [startingColor]);

  const hexInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length < 8) {
      isUpdatingFromInput.current = true;
      setSelectedColor(value);
      if (colorWheelRef.current) {
        colorWheelRef.current.hex = value
      }
      isUpdatingFromInput.current = false;
    }
  }

  return (
    <div className="flex flex-col items-center p-2 space-y-6 z-[1000] bg-white border border-grey shadow-lg rounded-lg">
      <div className='flex w-full items-center justify-between'>
        <h2 className="text-xl font-nunito m-0 ">Select a Colour</h2>
        <button className='p-2 m-0 ' onClick={() => {addHexToRecent(selectedColor.toUpperCase()); onClose();}}>
          <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
        </button>
      </div>
      
      <div className='flex w-full h-full'>
        <div className='flex flex-col w-full h-full'>
          {/* Color Wheel Mount Point */}
          <div ref={containerRef} className="relative p-2" />

          {/* Color Preview */}
          <div className="flex w-full flex-col text-center items-center justify-center">
            <div className='flex w-full items-center justify-center mb-2 text-sm'>
              <p className="pr-2">Hex Colour</p>
              <input className="flex w-[4.5rem] bg-background border border-grey rounded-md p-1 shadow-md transition-shadow duration-300 focus:shadow-[0_0_0_0.2rem_theme('colors.accent')] focus:outline-none focus:border-transparent" onChange={hexInputHandler} value={selectedColor} />
            </div>
            
            <div
              className="w-12 h-12 rounded-full border border-gray-300 shadow-md"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </div>
        <div className='flex flex-col w-full h-full p-2'>
            <p className=''>Default Colours</p>
            <div className='grid grid-cols-6 grid-rows-4 gap-2 w-fit'>
              {defaultColors.map((colorHex, colorIndex) => (
                <button 
                  key={colorIndex}
                  className={`w-6 h-6 border border-grey rounded-md shadow-sm`}
                  style={{ backgroundColor: colorHex }}  
                  onClick={() => {
                    setSelectedColor(colorHex);
                    passColorValue(colorHex);
                    if (colorWheelRef.current) {
                      colorWheelRef.current.hex = colorHex
                    }
                  }}  
                />
              ))}
            </div>
            <p className='mt-2'>Recent Colours</p>
            <div className='grid grid-cols-6 grid-rows-4 gap-2 w-fit'>
              {recentColors.map((colorHex, colorIndex) => {
                if (colorHex === '') {
                  return(
                    <button 
                      key={colorIndex}
                      className={`w-6 h-6 border border-grey rounded-md shadow-sm
                        relative bg-background
                        before:content-[''] before:absolute
                        before:h-px before:bg-grey
                        before:w-[1.8125rem] before:top-1/2 before:left-1/2
                        before:-translate-x-1/2 before:-translate-y-1/2
                        before:origin-center before:rotate-[-45deg]
                        before:pointer-events-none
                        `}
                    />
                  );
                } else {
                  return(
                    <button 
                      key={colorIndex}
                      className={`w-6 h-6 border border-grey rounded-md shadow-sm`}
                      style={{ backgroundColor: colorHex }}  
                      onClick={() => {
                        setSelectedColor(colorHex);
                        passColorValue(colorHex);
                        if (colorWheelRef.current) {
                          colorWheelRef.current.hex = colorHex
                        }
                      }}  
                    />
                  );
                }
              })}
            </div>
        </div>
      </div>
    </div>
  );
}

export default ColorSelectorSection;