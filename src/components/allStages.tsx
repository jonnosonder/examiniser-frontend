'use client';

import { useEffect, useState, useRef, RefObject, useMemo } from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import React from "react";
import { getStages, getGroups, subscribeStage, subscribeGroup, maxWidthHeight, getMarginValue, getViewMargin } from '@/lib/stageStore';
import "@/styles/allStages.css"
import CanvasElements from '@/components/canvasElements'
import Konva from 'konva';

type AllStagesProps = {
  manualScaler: number;
  selectedId: number | null;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
  ignoreSelectionArray: React.RefObject<HTMLElement | null>[];
};

export default function AllStages({ manualScaler, selectedId, setSelectedId, ignoreSelectionArray } : AllStagesProps) {
  const [stages, setStages] = useState(getStages());
  const [groups, setGroups] = useState(getGroups());

  const wholeContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const [estimatedPage, setEstimatedPage] = useState(1);
  
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

      const scale = Math.min(
        divContainer.width / (displayDimension.maxWidth),
        divContainer.height / (displayDimension.maxHeight)
      );

      setContainerWidth(displayDimension.maxWidth * scale);
      setContainerHeight(displayDimension.maxHeight * scale);
    }
  }, [stages]);

  useEffect(() => {
    const handleScroll = () => {
      if (stages.length === 0) {
        setEstimatedPage(0);
        return;
      }
      const el = wholeContainerRef.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;

      const scrollValue = (scrollTop / (scrollHeight - clientHeight));
      const estimatedPage = Math.min(Math.floor(scrollValue * stages.length)+1, stages.length);

      setEstimatedPage(estimatedPage);
    };

    const el = wholeContainerRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [stages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      let toSetNull = true
      ignoreSelectionArray.forEach(element => {
        if (element.current && element.current.contains(e.target as Node)) {
          toSetNull = false;
          return;
        }
      });
      if (toSetNull) {
        setSelectedId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const marginValue = getMarginValue();
  const viewMargin = getViewMargin();
  
  const stageRefs = useRef<React.RefObject<Konva.Stage | null>[]>([]);

  // Ensure the array has the right length:
  while (stageRefs.current.length < stages.length) {
    stageRefs.current.push(React.createRef<Konva.Stage | null>());
  }

  // Now assign refs:
  stages.forEach((stage, stageIndex) => {
    stage.stageRef = stageRefs.current[stageIndex];
  });

  return (
    <div ref={wholeContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4'>
      {stages.map((stage) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);
        return (
          <div key={stage.id+"wrap"} className='flex flex-col w-full h-full items-center justify-start'>
          <p key={stage.id+"p"} className='flex text-darkGrey text-[0.6rem] text-left'>{stage.width}px x {stage.height}px</p>
          <div ref={stageContainerRef} key={stage.id+"div"} className='flex flex-col w-full h-full items-center justify-start'>
              <div
                className='flex'
                style={{
                  width: stage.width * scale * manualScaler,
                  height: stage.height * scale * manualScaler,
                  overflow: 'hidden',
                  transformOrigin: 'top left',
                }}
              >
              <Stage
                width={stage.width}
                height={stage.height}
                scaleX={scale * manualScaler}
                scaleY={scale * manualScaler}
                pixelRatio={300}
                style={{
                  transformOrigin: 'top left',
                }}
                ref={stage.stageRef}
              >
                <Layer>
                  <Rect 
                    x={0}
                    y={0}
                    width={stage.width}
                    height={stage.height}
                    fill={stage.background || '#ffffff'}
                  />
                  { viewMargin && ( 
                  <Rect 
                    x={marginValue}
                    y={marginValue}
                    width={stage.width-(marginValue*2)}
                    height={stage.height-(marginValue*2)}
                    fill={"transparent"}
                    stroke={"black"}
                    strokeWidth={2}
                  />
                  )}
                  {groups.map((group, i) => {
                    let widestX = 0;
                    let widestY = 0;

                    group.forEach((element) => {
                      let x: number;
                      let y: number;
                      if (element.type === "oval"){
                        x = element.x + element.width/2;
                        y = element.y + element.height/2;
                      } else {
                        x = element.x + element.width;
                        y = element.y + element.height;
                      }
                      if (x > widestX) widestX = x;
                      if (y > widestY) widestY = y;
                    });

                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const scaled = scale * manualScaler;

                      // Convert from pixel space → logical stage space
                      let x = pos.x / scaled;
                      let y = pos.y / scaled;
                      //console.log({x, y});

                      // Clamp to the stage bounds
                      const minX = marginValue;
                      const minY = marginValue;
                      const maxX = stage.width - marginValue - widestX;
                      const maxY = stage.height - marginValue - widestY;

                      if (x < minX) x = minX;
                      if (y < minY) y = minY;
                      if (x > maxX) x = maxX;
                      if (y > maxY) y = maxY;

                      // Convert back to pixel space
                      return {
                        x: marginValue * scaled, //x * scaled,
                        y: y * scaled,
                      };
                    };

                    return (
                      <Group
                        key={i}
                        x={marginValue}
                        y={marginValue}
                        width={stage.width - marginValue*2}
                        height={widestY}
                        draggable={true}
                        dragBoundFunc={dragBoundFunc}
                        listening={true}
                        onClick={() => setSelectedId(i)}
                        onTap={() => setSelectedId(i)}
                      > 
                        <Rect
                          width={stage.width - marginValue * 2}
                          height={widestY}
                          dragBoundFunc={dragBoundFunc}
                          fill="rgba(0,0,0,0)" // invisible but interactive
                        />
                        {i === selectedId && 
                        <Rect
                          x={-5}
                          y={-5}
                          width={stage.width - marginValue * 2 +10}
                          height={widestY+10}
                          stroke={'#F57C22'}
                          strokeWidth={10}
                          fillEnabled={false}
                          cornerRadius={10}
                          listening={false}
                        />
                        }
                        {group.map((shape) => {
                          return(
                          <CanvasElements
                            key={shape.id}
                            shape={shape}
                            isSelected={false}
                            onSelect={() => (null)}
                            onChange={() => (null)}
                            setDraggable={false}
                            stageScale={scale}
                            listening={false}
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
          </div>
        );
      })}
    
      <div className='absolute bg-gray-600 opacity-50 bottom-2 px-2 py-1'>
        <p className='text-white'>{estimatedPage} / {stages.length}</p>
      </div>
    </div>
  );
}
