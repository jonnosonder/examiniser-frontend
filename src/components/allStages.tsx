'use client';

import { useEffect, useState, useRef} from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import React from "react";
import { getStages, subscribeStage, maxWidthHeight, getMarginValue, getViewMargin, setGlobalStageScale, getGlobalStageScale, getPageElements, getPageElementsInfo, getEstimatedPage, setEstimatedPage, setPageElementsInfo } from '@/lib/stageStore';
import "@/styles/allStages.css"
import CanvasElements from '@/components/canvasElements'
import Konva from 'konva';

type AllStagesProps = {
  manualScaler?: number;
  selectedId?: setSelectedIdType;
  setSelectedId?: React.Dispatch<React.SetStateAction<setSelectedIdType>>;
  ignoreSelectionArray?: React.RefObject<HTMLElement | null>[];
  previewStyle: boolean;
  editQuestionButtonHandler?: (passedPage?: number, passedGroupID?: number) => void;
};

type setSelectedIdType = {
  groupID: number | null;
  page: number | null;
};

export default function AllStages({ manualScaler=1, selectedId={groupID: null, page: null}, setSelectedId, ignoreSelectionArray, previewStyle, editQuestionButtonHandler } : AllStagesProps) {
  const [stages, setStages] = useState(getStages());
  const pageElements = getPageElements();
  const pageElementsInfo = getPageElementsInfo();

  const wholeContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  let [stageEstimatedPage, setStageEstimatedPage] = useState(getEstimatedPage());
  
  useEffect(() => {
    const unsubscribeStage = subscribeStage(() => {
      setStages(getStages());
    });
    return () => unsubscribeStage();
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
    if (!previewStyle) {
      const handleScroll = () => {
        if (stages.length === 0) {
          setStageEstimatedPage(0);
          setEstimatedPage(0);
          return;
        }
        const el = wholeContainerRef.current;
        if (!el) return;

        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;

        const scrollValue = (scrollTop / (scrollHeight - clientHeight));
        const estimatedPageCal = Math.min(Math.floor(scrollValue * stages.length), stages.length-1);
        setStageEstimatedPage(estimatedPageCal);
        setEstimatedPage(estimatedPageCal);
      };

      const el = wholeContainerRef.current;
      if (el) el.addEventListener('scroll', handleScroll);

      return () => {
        if (el) el.removeEventListener('scroll', handleScroll);
      };
    }
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
          setSelectedId({groupID: null, page: null});
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

  const previewFontScale = getGlobalStageScale();

  return (
    <div ref={wholeContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4' id={!previewStyle ? `wholeStageContainerScroller` : ''}>
      {stages.map((stage, pageNumber) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);
        if (!previewStyle) {
          setGlobalStageScale(scale);
        }

        console.log(pageElements);
        let aPagesElements = pageElements.slice(pageNumber, pageNumber+1)[0];
        if (!aPagesElements) {
          aPagesElements = [];
        }

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
                  { aPagesElements.map((group, i) => {
                    
                    let dragBoundFunc: ((pos: { x: number; y: number }) => { x: number; y: number }) | undefined;
                    if (!previewStyle) {
                      dragBoundFunc = (pos: { x: number; y: number }) => {
                        const scaled = scale * manualScaler;

                        let x = pos.x / scaled;
                        let y = pos.y / scaled;

                        const minX = 0;
                        const minY = 0;
                        const maxX = stage.width - pageElementsInfo[pageNumber][i].widestX;
                        const maxY = stage.height - pageElementsInfo[pageNumber][i].widestY;

                        if (x < minX) x = minX;
                        if (y < minY) y = minY;
                        if (x > maxX) x = maxX;
                        if (y > maxY) y = maxY;

                        return {
                          x: x * scaled,
                          y: y * scaled,
                        };
                      };
                    }

                    return (
                      <Group
                        key={i}
                        x={pageElementsInfo[pageNumber][i].x}
                        y={pageElementsInfo[pageNumber][i].y}
                        width={pageElementsInfo[pageNumber][i].widestX}
                        height={pageElementsInfo[pageNumber][i].widestY}
                        draggable={!previewStyle}
                        dragBoundFunc={!previewStyle ? dragBoundFunc : undefined}
                        listening={!previewStyle}
                        onClick={() => setSelectedId?.({groupID: i, page: pageNumber})}
                        onTap={() => setSelectedId?.({groupID: i, page: pageNumber})}
                        onDblClick={() => {!previewStyle && editQuestionButtonHandler?.(pageNumber, i)}}
                        onDblTap={() => {!previewStyle && editQuestionButtonHandler?.(pageNumber, i)}}
                        onDragEnd={ (e) => {
                          setPageElementsInfo({ ...pageElementsInfo[pageNumber][i], x: Math.round((e.target.x() + Number.EPSILON) * 100000) / 100000, y: Math.round((e.target.y() + Number.EPSILON) * 100000) / 100000 }, pageNumber, i);
                        }}

                      > 
                        <Rect
                          width={pageElementsInfo[pageNumber][i].widestX}
                          height={pageElementsInfo[pageNumber][i].widestY}
                          dragBoundFunc={!previewStyle ? dragBoundFunc : undefined}
                          fill="rgba(0,0,0,0)" // invisible but interactive
                        />
                        {i === selectedId.groupID && pageNumber === selectedId.page && 
                        <Rect
                          x={0}
                          y={0}
                          width={pageElementsInfo[pageNumber][i].widestX}
                          height={pageElementsInfo[pageNumber][i].widestY}
                          stroke={'#F57C22'}
                          strokeWidth={20}
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
                            fontScale={previewStyle ? previewFontScale : scale}
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
          <p className='text-white'>{stageEstimatedPage+1} / {stages.length}</p>
        </div>
      )}
    </div>
  );
}
