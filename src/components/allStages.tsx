'use client';

import { useEffect, useState, useRef} from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import React from "react";
import { getStages, getGroups, subscribeStage, subscribeGroup, maxWidthHeight, getMarginValue, getViewMargin, setGlobalStageScale, getGroupInfo } from '@/lib/stageStore';
import "@/styles/allStages.css"
import CanvasElements from '@/components/canvasElements'
import Konva from 'konva';

type AllStagesProps = {
  manualScaler?: number;
  selectedId?: number | null;
  setSelectedId?: React.Dispatch<React.SetStateAction<number | null>>;
  ignoreSelectionArray?: React.RefObject<HTMLElement | null>[];
  previewStyle: boolean;
};

export default function AllStages({ manualScaler=1, selectedId=null, setSelectedId, ignoreSelectionArray, previewStyle } : AllStagesProps) {
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
    if (!previewStyle && ignoreSelectionArray && setSelectedId) {
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
    }
  }, []);

  const marginValue = getMarginValue();
  const viewMargin = getViewMargin();
  
  const stageRefs = useRef<React.RefObject<Konva.Stage | null>[]>([]);

  while (stageRefs.current.length < stages.length) {
    stageRefs.current.push(React.createRef<Konva.Stage | null>());
  }

  stages.forEach((stage, stageIndex) => {
    stage.stageRef = stageRefs.current[stageIndex];
  });

  let previewPageOnClickHanlder: ((pageNumber: number) => void) | undefined;
  
  if (previewStyle) {
    previewPageOnClickHanlder = (pageNumber: number) => {
      const container = document.getElementById('wholeStageContainerScroller');
      const element = document.getElementById('stageDivSelect'+pageNumber);
      if (element && container) {
        element.scrollIntoView({
          behavior: 'smooth',  // Smooth scroll animation
          block: 'start',      // Align to the top of the container
        });
      }
    }
  }

  const groupInfo = getGroupInfo();

  let groupIndexToDraw = 0;
  return (
    <div ref={wholeContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4' id={!previewStyle ? `wholeStageContainerScroller` : ''}>
      {stages.map((stage, pageNumber) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);
        setGlobalStageScale(scale);

        const maxYSpace = stage.height - (marginValue*2);
        let spaceTakenOnPage = 0;
        let x = 0;
        while (groupIndexToDraw+x < groups.length) {
          if (spaceTakenOnPage + groupInfo[groupIndexToDraw + x].widestY < maxYSpace) {
            spaceTakenOnPage += groupInfo[groupIndexToDraw + x].widestY;
            x += 1;
          } else {
            break;
          }
        }

        const selectedPageGroups = groups.slice(groupIndexToDraw, x+groupIndexToDraw);
        groupIndexToDraw += x;

        let groupPositionY = 0;
        return (
          <div key={stage.id+"wrap"} className='flex flex-col w-full h-full items-center justify-start' id={!previewStyle ? `stageDivSelect${pageNumber}` : ''}>
          {!previewStyle && (
            <p key={stage.id+"p"} className='flex text-darkGrey text-[0.6rem] text-left'>{stage.width}px x {stage.height}px</p>
          )}
          <div ref={stageContainerRef} key={stage.id+"div"} onClick={() => previewPageOnClickHanlder?.(pageNumber)} className='flex flex-col w-full h-full items-center justify-start'>
              <div
                className={`flex ${previewStyle && `border border-primary rounded-sm transition-shadow duration-300 hover:shadow-[0_0_0_0.2rem_theme('colors.contrast')]`} overflow-hidden`}
                style={{
                  width: stage.width * scale * manualScaler,
                  height: stage.height * scale * manualScaler,
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
                  { (viewMargin && !previewStyle) && ( 
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
                  {selectedPageGroups.map((group, i) => {
                    
                    let dragBoundFunc: ((pos: { x: number; y: number }) => { x: number; y: number }) | undefined;
                    if (!previewStyle) {
                      dragBoundFunc = (pos: { x: number; y: number }) => {
                        const scaled = scale * manualScaler;

                        // Convert from pixel space → logical stage space
                        let x = pos.x / scaled;
                        let y = pos.y / scaled;
                        //console.log({x, y});

                        // Clamp to the stage bounds
                        const minX = marginValue;
                        const minY = marginValue;
                        const maxX = stage.width - marginValue - groupInfo[i].widestX;
                        const maxY = stage.height - marginValue - groupInfo[i].widestY;

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
                    }

                    if (i !== 0) {
                      groupPositionY += groupInfo[i-1].widestY;
                    }

                    return (
                      <Group
                        key={i}
                        x={marginValue}
                        y={marginValue + groupPositionY}
                        width={stage.width - marginValue*2}
                        height={groupInfo[i].widestY}
                        draggable={!previewStyle}
                        dragBoundFunc={!previewStyle ? dragBoundFunc : undefined}
                        listening={!previewStyle}
                        onClick={() => setSelectedId?.(i)}
                        onTap={() => setSelectedId?.(i)}
                      > 
                        <Rect
                          width={stage.width - marginValue * 2}
                          height={groupInfo[i].widestY}
                          dragBoundFunc={!previewStyle ? dragBoundFunc : undefined}
                          fill="rgba(0,0,0,0)" // invisible but interactive
                        />
                        {i === selectedId && 
                        <Rect
                          x={-5}
                          y={-5}
                          width={stage.width - marginValue * 2 +10}
                          height={groupInfo[i].widestY+10}
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
                            fontScale={scale}
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
            {previewStyle && (
              <p key={stage.id+"previewPageNumber"} className='flex text-primary text-[0.8rem] text-left'>{pageNumber+1}</p>
            )}
          </div>
          </div>
        );
      })}

      {!previewStyle && (
        <div className='absolute bg-gray-600 opacity-50 bottom-2 px-2 py-1'>
          <p className='text-white'>{estimatedPage} / {stages.length}</p>
        </div>
      )}
    </div>
  );
}
