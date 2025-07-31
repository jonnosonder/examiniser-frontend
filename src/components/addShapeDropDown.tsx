// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';
import { ShapeData } from '@/lib/shapeData';
import { addPageElement, addPageElementsInfo, getEstimatedPage, RENDER_PAGE } from '@/lib/stageStore';
import React, { useState } from 'react';

const AddShapeDropDown: React.FC = () => {
  const [open, setOpen] = useState(false);

  const showDropdown = () => {
    setOpen(true);
  };

  const hideDropdown = () => {
    setOpen(false)
  };

  const toggleDropdown = () => setOpen((prev) => !prev);

  const addSquareToPageButtonHandler = () => {
    const pageToAddIt = getEstimatedPage();
    const newSquare: ShapeData = {
      id: 'r'+Date.now(),
      type: 'rect',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      fill: 'black',
      stroke: 'red',
      strokeWidth: 1,
      cornerRadius: 0,
    };
    addPageElementsInfo({widestX: newSquare.width, widestY: newSquare.height, x:0, y:0}, pageToAddIt);
    addPageElement([newSquare], pageToAddIt);
    RENDER_PAGE();
    hideDropdown();
  }

  const addCircleToPageButtonHandler = () => {
    const pageToAddIt = getEstimatedPage();
    const newCircle: ShapeData = {
      id: 'c'+Date.now(),
      type: 'oval',
      x: 40,
      y: 40,
      radiusX: 40,
      radiusY: 40,
      rotation: 0,
      fill: 'black',
      stroke: 'red',
      strokeWidth: 1,
    };
    addPageElementsInfo({widestX: newCircle.radiusX*2, widestY: newCircle.radiusY*2, x:0, y:0}, pageToAddIt);
    addPageElement([newCircle], pageToAddIt);
    RENDER_PAGE();
    hideDropdown();
  }

  const addTriangleToPageButtonHandler = () => {
    const pageToAddIt = getEstimatedPage();
    const newTriangle: ShapeData = {
      id: 't'+Date.now(),
      type: 'tri',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      fill: 'black',
      stroke: 'red',
      strokeWidth: 1,
      cornerRadius: 0,
    };
    addPageElementsInfo({widestX: newTriangle.width, widestY: newTriangle.height, x:0, y:0}, pageToAddIt);
    addPageElement([newTriangle], pageToAddIt);
    RENDER_PAGE();
    hideDropdown();
  }

  const addRightAngleTriangleToPageButtonHandler = () => {
    const pageToAddIt = getEstimatedPage();
    const newTriangle: ShapeData = {
      id: 't'+Date.now(),
      type: 'rightAngleTri',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      fill: 'black',
      stroke: 'red',
      strokeWidth: 1,
      cornerRadius: 0,
    };
    addPageElementsInfo({widestX: newTriangle.width, widestY: newTriangle.height, x:0, y:0}, pageToAddIt);
    addPageElement([newTriangle], pageToAddIt);
    RENDER_PAGE();
    hideDropdown();
  }

  const addStarToPageButtonHandler = () => {
    const pageToAddIt = getEstimatedPage();
    const newCircle: ShapeData = {
      id: 's'+Date.now(),
      type: 'star',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      fill: 'black',
      stroke: 'red',
      strokeWidth: 1,
      numPoints: 5,
    };
    addPageElementsInfo({widestX: newCircle.width, widestY: newCircle.height, x:0, y:0}, pageToAddIt);
    addPageElement([newCircle], pageToAddIt);
    RENDER_PAGE();
    hideDropdown();
  }

  return (
    <div
      className="relative inline-block h-full"
      onMouseEnter={showDropdown}
      onMouseLeave={hideDropdown}
    >
      <button
        className="text-white rounded h-full"
        onClick={toggleDropdown}
      >
        <svg className='h-full p-1' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="11" height="11" rx="0.5" stroke="black"/>
            <path d="M9.5 15.5C9.5 18.8137 12.1863 21.5 15.5 21.5C18.8137 21.5 21.5 18.8137 21.5 15.5C21.5 12.1863 18.8137 9.5 15.5 9.5" stroke="black"/>
            <path d="M2 19L5 22L8 19" stroke="black"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-10 z-10"
          onMouseEnter={showDropdown}
          onMouseLeave={hideDropdown}
        >
            <div className='flex flex-col bg-background mt-2 p-2 border border-primary rounded shadow text-primary'>
                <p className='whitespace-nowrap text-left mb-2'>Add Shape</p>
                <div className='flex h-10 items-center justify-center space-x-2'>
                  {/* Square */}
                  <button className='h-full' onClick={addSquareToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.5" y="2.5" width="19" height="19" stroke="black"/>
                    </svg>
                  </button>
                  {/* Circle */}
                  <button className='h-full' onClick={addCircleToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9.5" stroke="black"/>
                    </svg>
                  </button>
                  {/* Triangle */}
                  <button className='h-full' onClick={addTriangleToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.0264 20.5H2.97363L12.5 3.99902L22.0264 20.5Z" stroke="black"/>
                    </svg>
                  </button>
                  {/* Right Angle Triangle */}
                  <button className='h-full' onClick={addRightAngleTriangleToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.793 21.5H2.5V3.20703L20.793 21.5Z" stroke="black"/>
                    </svg>
                  </button>
                </div>
                <div className='flex h-10 items-center justify-center space-x-2'>
                  {/* Star */}
                  <button className='h-full' onClick={addStarToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.3154 9.36914L14.4326 9.65137L14.7373 9.67578L20.748 10.1572L16.1689 14.0801L15.9365 14.2793L16.0078 14.5762L17.4062 20.4414L12.2607 17.2979L12 17.1387L11.7393 17.2979L6.59277 20.4414L7.99219 14.5762L8.06348 14.2793L7.83105 14.0801L3.25098 10.1572L9.2627 9.67578L9.56738 9.65137L9.68457 9.36914L12 3.80273L14.3154 9.36914Z" stroke="black"/>
                    </svg>
                  </button>
                  {/* Trapezoid */}
                  <button className='h-full' onClick={addStarToPageButtonHandler}>
                    <svg className='h-full' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 17H3L7.5 7H16.5L21 17Z" stroke="black"/>
                    </svg>
                  </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddShapeDropDown;
