'use client';

import { useEffect, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { getStages, subscribe } from '@/lib/stageStore';

export default function AllStages() {
  const [stages, setStages] = useState(getStages());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStages(getStages());
    });
    return () => unsubscribe();
  }, []);

  // The fixed size of the preview container
  const containerWidth = 500;
  const containerHeight = 700;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {stages.map((stage) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);

        return (
          <div
            key={stage.id}
            style={{
              width: containerWidth,
              height: containerHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ccc',
              background: '#f9f9f9',
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
                <Rect
                  x={20}
                  y={20}
                  width={500}
                  height={500}
                  fill="lightblue"
                  shadowBlur={5}
                  draggable
                />
              </Layer>
            </Stage>
          </div>
        );
      })}
    </div>
  );
}
