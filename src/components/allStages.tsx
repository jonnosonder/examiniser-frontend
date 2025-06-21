'use client';

import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { getStages, subscribe, maxWidthHeight } from '@/lib/stageStore';
import "@/styles/allStages.css"

export default function AllStages() {
  const [stages, setStages] = useState(getStages());

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  //const [marginValueX, setMarginValueX] = useState<number>(112);
  //const [marginValueY, setMarginValueY] = useState<number>(80);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStages(getStages());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (stageContainerRef.current) {
      const displayDimension = maxWidthHeight();
      const divContainer = stageContainerRef.current.getBoundingClientRect();
      const adjust = 20;
      const scale = Math.min(divContainer.width / (displayDimension.maxWidth - adjust), divContainer.height / (displayDimension.maxHeight - adjust));
      console.log(scale);
      setContainerWidth(displayDimension.maxWidth * scale);
      setContainerHeight(displayDimension.maxHeight * scale);
      console.log(displayDimension.maxWidth * scale);
      console.log(displayDimension.maxHeight * scale);
    }
  }, [stages]);

  return (
    <div ref={stageContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4'>
      {stages.map((stage) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);

        return (
          <div
            key={stage.id}
            className='flex items-center justify-center bg-white'
            style={{
              width: containerWidth,
              height: containerHeight,
            }}
          >
            <Stage
              width={containerWidth}
              height={containerHeight}
              scaleX={scale}
              scaleY={scale}
              style={{
                width: containerWidth,
                height: containerHeight,
                transformOrigin: 'top left',
              }}
            >
              <Layer>
                
              </Layer>
            </Stage>
          </div>
        );
      })}
    </div>
  );
}
