'use client';

import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { getStages, getGroups, subscribeStage, subscribeGroup, maxWidthHeight } from '@/lib/stageStore';
import "@/styles/allStages.css"
import CanvasElements from '@/components/canvasElements'

type AllStagesProps = {
  manualScaler: number;
};

export default function AllStages({ manualScaler } : AllStagesProps) {
  const [stages, setStages] = useState(getStages());
  const [groups, setGroups] = useState(getGroups());

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  useEffect(() => {
    const unsubscribeStage = subscribeStage(() => {
      setStages(getStages());
    });
    return () => unsubscribeStage();
  }, []);

  useEffect(() => {
    const unsubscribeShape = subscribeGroup(() => {
      setGroups(getGroups());
    });
    return () => unsubscribeShape();
  }, []);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (stageContainerRef.current) {
      const displayDimension = maxWidthHeight();
      const divContainer = stageContainerRef.current.getBoundingClientRect();
      const adjust = 20;

      const scale = Math.min(
        divContainer.width / (displayDimension.maxWidth + adjust),
        divContainer.height / (displayDimension.maxHeight + adjust)
      );

      setContainerWidth(displayDimension.maxWidth * scale);
      setContainerHeight(displayDimension.maxHeight * scale);
    }
  }, [stages]);

  const calculateMargin = (width:number, height:number, percentage:number = 12.5) => {
      const shortestSide = Math.min(width, height);
      console.log(Math.round((shortestSide * percentage) / 100));
      return Math.round((shortestSide * percentage) / 100);
  }

  return (
    <div ref={stageContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4'>
      {stages.map((stage) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);

        return (
          <div key={stage.id+"div"}>
            <p key={stage.id+"p"} className='flex text-darkGrey text-xs text-left'>{stage.width}px x {stage.height}px</p>
            <div
              key={stage.id}
              className='flex flex-col items-center justify-center bg-white'
              style={{
                width: containerWidth * manualScaler,
                height: containerHeight * manualScaler,
                transformOrigin: 'top left',
              }}
            >
              <Stage
                width={containerWidth * manualScaler}
                height={containerHeight * manualScaler}
                scaleX={scale * manualScaler}
                scaleY={scale * manualScaler}
                style={{
                  width: containerWidth * manualScaler,
                  height: containerHeight * manualScaler,
                  transformOrigin: 'top left',
                }}
              >
                <Layer>
                  {groups.map((group, i) => {
                    /*
                    const marginVlaue = calculateMargin(stage.width, stage.height);

                    let widestX = 0;
                    let widesty = 0;
                    group.map((element) => {
                      const x = element.x + element.width;
                      const y = element.y + element.height;
                      if (x > widestX) widestX = x;
                      if (y > widesty) widesty = y;
                    })
                    
                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const adjustedPos = {
                        x: pos.x / scale,
                        y: pos.y / scale
                      };
                      console.log(adjustedPos.x);
                      console.log(adjustedPos.y);
                      const minX = marginVlaue;
                      const maxX = stage.width - marginVlaue - widestX;
                      const minY = marginVlaue;
                      const maxY = stage.height - marginVlaue - widesty;

                      const bounded = {
                        x: Math.max(minX, Math.min(adjustedPos.x, maxX)),
                        y: Math.max(minY, Math.min(adjustedPos.y, maxY)),
                      };

                      return {
                        x: bounded.x * scale,
                        y: bounded.y * scale
                      };
                    };
                    */
                    return (
                      <Group
                        key={i}
                        x={0}
                        y={0}
                        draggable
                        //dragBoundFunc={dragBoundFunc}
                      >
                        {group.map((shape) => {
                          return(
                          <CanvasElements
                            key={shape.id}
                            shape={shape}
                            isSelected={false}
                            onSelect={() => (null)}
                            onChange={() => (null)}
                            setDraggable={false}
                          />
                          );
                        })}
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          </div>
        );
      })}
    </div>
  );
}
