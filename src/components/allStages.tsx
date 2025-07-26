'use client';

import { useEffect, useState, useRef} from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import React from "react";
import { getStages, subscribeStage, maxWidthHeight, getMarginValue, getViewMargin, setGlobalStageScale, getGlobalStageScale, getPageElements, getPageElementsInfo, getEstimatedPage, setEstimatedPage, setPageElementsInfo, subscribePreviewStage, RENDER_PREVIEW, deletePageElement, deletePageElementInfo, changePageOfElement, changePageOfElementInfo, RENDER_PAGE } from '@/lib/stageStore';
import "@/styles/allStages.css"
import Konva from 'konva';
import DrawElement from './drawElement';
import { ShapeData } from '@/lib/shapeData';
import { useNotification } from '@/context/notificationContext';

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

const AllStages = ({ manualScaler=1, selectedId={groupID: null, page: null}, setSelectedId, ignoreSelectionArray, previewStyle, editQuestionButtonHandler } : AllStagesProps) => {
  const [stages, setStages] = useState(getStages());
  const pageElements = getPageElements();
  const pageElementsInfo = getPageElementsInfo();

  const wholeContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const [stageEstimatedPage, setStageEstimatedPage] = useState(getEstimatedPage());

  const [showSelectButtons, setShowSelectButtons] = useState(false);
  const [selectButtonPosition, setSelectButtonPosition] = useState({ x: 0, y: 0 });

  const { notify } = useNotification();

  useEffect(() => {
    if (selectedId.groupID === null || selectedId.page === null) {
      setShowSelectButtons(false);
    }
  }, [selectedId])
  
  useEffect(() => {
    if (previewStyle) {
      const unsubscribeStage = subscribePreviewStage(() => {
        console.log('Preview update triggered');
        setStages(getStages());
      });
      return () => unsubscribeStage();
    }
  }, []);

  useEffect(() => {
    if (!previewStyle) {
      const unsubscribeStage = subscribeStage(() => {
        console.log('Stage update triggered');
        setStages(getStages());
      });
      return () => unsubscribeStage();
    }
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

  const selectButtonsDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewStyle && ignoreSelectionArray && setSelectedId) {
      const handleClickOutside = (e: MouseEvent) => {
        if (selectedId.groupID !== null) {
          ignoreSelectionArray.forEach(element => {
            if (element.current && element.current.contains(e.target as Node)) {
              return;
            }
          });
          if (selectButtonsDivRef.current && selectButtonsDivRef.current.contains(e.target as Node)) {
            return;
          }
          setSelectedId({groupID: null, page: null});
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedId]);
  
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

  const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

  const selectButtonDeleteHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null) {
      deletePageElement(selectedId.page, selectedId.groupID);
      deletePageElementInfo(selectedId.page, selectedId.groupID);
    }
    setSelectedId?.({groupID: null, page: null});
    RENDER_PREVIEW();
  }

  const selectButtonMoveDownElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page < stages.length-1) {
      changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page+1);
      changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page+1);
      setSelectedId?.({groupID: selectedId.groupID, page: selectedId.page+1});
      RENDER_PAGE();
    } else {
      notify('info', 'No page bellow');
    }
  }

  const selectButtonMoveUpElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page > 0) {
      changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page-1);
      changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page-1);
      setSelectedId?.({groupID: selectedId.groupID, page: selectedId.page-1});
      RENDER_PAGE();
    } else {
      notify('info', 'No page above');
    }
  }

  return (
    <div ref={wholeContainerRef} className='overflow-y-auto custom-scroll h-full w-full flex flex-col items-center justify-start space-y-4 p-4' id={!previewStyle ? `wholeStageContainerScroller` : ''}>
      {stages.map((stage, pageNumber) => {
        const scaleX = containerWidth / stage.width;
        const scaleY = containerHeight / stage.height;
        const scale = Math.min(scaleX, scaleY);
        if (!previewStyle) {
          setGlobalStageScale(scale);
        }

        console.log(`Rending Page ${pageNumber+1}#`);
        let aPagesElements = pageElements.slice(pageNumber, pageNumber+1)[0];
        if (!aPagesElements) {
          aPagesElements = [];
        }

        return (
          <div key={stage.id+"wrap"} className='flex flex-col flex-shrink-1 w-full h-full items-center justify-start' id={!previewStyle ? `stageDivSelect${pageNumber}` : ''}>
          {!previewStyle && (
            <p key={stage.id+"p"} className='flex text-darkGrey text-[0.6rem] text-left'>{stage.width}px x {stage.height}px</p>
          )}
          <div ref={stageContainerRef} key={stage.id+"div"} onClick={() => previewPageOnClickHanlder?.(pageNumber)} className='flex flex-col w-full h-full items-center justify-start'>
              <div
                className={`flex flex-shrink-0 relative  ${previewStyle && `border border-primary rounded-sm transition-shadow duration-300 hover:shadow-[0_0_0_0.2rem_theme('colors.contrast')]`} overflow-hidden`}
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
                pixelRatio={1}
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
                    const focusGroup = pageElementsInfo[pageNumber][i];
                    let dragBoundFunc: ((pos: { x: number; y: number }) => { x: number; y: number }) | undefined;
                    if (!previewStyle) {
                      dragBoundFunc = (pos: { x: number; y: number }) => {
                        const scaled = scale * manualScaler;
                        const inverseScale = 1 / scaled;

                        let x = pos.x * inverseScale;
                        let y = pos.y * inverseScale;

                        const { width: stageWidth, height: stageHeight } = stage;
                        const elementInfo = focusGroup;

                        const maxX = stageWidth - elementInfo.widestX;
                        const maxY = stageHeight - elementInfo.widestY;

                        x = Math.max(0, Math.min(x, maxX));
                        y = Math.max(0, Math.min(y, maxY));

                        // Return in scaled space
                        return {
                          x: x * scaled,
                          y: y * scaled,
                        };
                      };
                    }

                    const onClickHandler = () => {
                      setSelectedId?.({groupID: i, page: pageNumber})
                      setSelectButtonPosition({
                        x: (focusGroup.x + focusGroup.widestX) * scale,
                        y: (focusGroup.y + focusGroup.widestY) * scale,
                      });
                      console.log((focusGroup.x + focusGroup.widestX) * scale);
                      console.log((focusGroup.y + focusGroup.widestY) * scale);
                      setShowSelectButtons(true);
                    } 

                    const onDbClickHandler = () => {
                      editQuestionButtonHandler?.(pageNumber, i)
                      setShowSelectButtons(false);
                    } 

                    return (
                      <Group
                        key={i + (i * pageNumber+1)}
                        x={focusGroup.x}
                        y={focusGroup.y}
                        width={focusGroup.widestX}
                        height={focusGroup.widestY}
                        draggable={!previewStyle}
                        dragBoundFunc={!previewStyle ? dragBoundFunc : undefined}
                        listening={!previewStyle}
                        onClick={onClickHandler}
                        onTap={onClickHandler}
                        onDblClick={onDbClickHandler}
                        onDblTap={onDbClickHandler}
                        onDragEnd={ (e) => {
                          const newX = round4(e.target.x());
                          const newY = round4(e.target.y());
                          setPageElementsInfo({ ...focusGroup, x: newX, y: newY }, pageNumber, i);
                          setSelectButtonPosition({
                            x: newX * scale,
                            y: newY * scale,
                          });
                          RENDER_PREVIEW();
                        }}
                      > 
                        <Rect
                          x={0}
                          y={0}
                          width={focusGroup.widestX}
                          height={focusGroup.widestY}
                          fill="rgba(0,0,0,0)" // invisible but interactive
                          listening={true}
                        />
                        {i === selectedId.groupID && pageNumber === selectedId.page && 
                          <Rect
                            x={-10}
                            y={-10}
                            width={focusGroup.widestX+20}
                            height={focusGroup.widestY+20}
                            stroke={'#F57C22'}
                            strokeWidth={20}
                            fillEnabled={false}
                            listening={false}
                            cornerRadius={10}
                          />
                        }
                        {group.map((shape) => {
                          return(
                          <DrawElement
                            key={shape.id}
                            shape={shape}
                            fontScale={previewStyle ? previewFontScale : scale}
                          />
                          );
                        })}
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
              {!previewStyle && showSelectButtons && selectedId.page === pageNumber && (
                <div 
                  className={`absolute flex bg-background rounded-sm border border-primary items-center justify-center z-10`}
                  style={{
                    top: selectButtonPosition.y + 5,
                    left: selectButtonPosition.x + 5
                  }}
                  ref={selectButtonsDivRef}
                >
                  <button onClick={selectButtonMoveDownElementHandler} className='w-5 h-5 items-center justify-center p-1'>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9106 21.8211L3.07236 4.14472C3.03912 4.07823 3.08747 4 3.1618 4H20.8382C20.9125 4 20.9609 4.07823 20.9276 4.14472L12.0894 21.8211C12.0526 21.8948 11.9474 21.8948 11.9106 21.8211Z" fill="black" stroke="black" strokeWidth="2"/></svg>
                  </button>
                  <button onClick={selectButtonMoveUpElementHandler} className='w-5 h-5 items-center justify-center p-1'>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0894 3.17889L20.9276 20.8553C20.9609 20.9218 20.9125 21 20.8382 21L3.1618 21C3.08747 21 3.03912 20.9218 3.07236 20.8553L11.9106 3.17889C11.9474 3.10518 12.0526 3.10518 12.0894 3.17889Z" fill="black" stroke="black" strokeWidth="2"/></svg>
                  </button>
                  <button onClick={selectButtonDeleteHandler} className='w-5 h-5 items-center justify-center'>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L20 4M4 4L20 20" stroke="black" strokeWidth="1.5"/></svg>
                  </button>
                </div>
              )}
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

export default React.memo(AllStages);