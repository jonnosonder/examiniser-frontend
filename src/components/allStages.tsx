// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { useEffect, useState, useRef, useMemo, RefObject, useCallback} from 'react';
import { Stage, Layer, Group, Rect, Transformer } from 'react-konva';
import React from "react";
import { getStages, subscribeStage, maxWidthHeight, getMarginValue, getViewMargin, getPageElements, getPageElementsInfo, getEstimatedPage, setEstimatedPage, setPageElementsInfo, subscribePreviewStage, RENDER_PREVIEW, deletePageElement, deletePageElementInfo, changePageOfElement, changePageOfElementInfo, RENDER_PAGE, duplicatePageElementsInfo, duplicatePageElement, groupsOnPage, minWidthHeight, setPageElementWidth, getPageGroup, setPageElementHeight, setPageElementsInfoWidth, setPageElementsInfoHeight } from '@/lib/stageStore';
import "@/styles/allStages.css"
import Konva from 'konva';
import DrawElement from './drawElement';
import { ShapeData } from '@/lib/shapeData';
import { useNotification } from '@/context/notificationContext';
import KonvaPage from './konvaPage';

type AllStagesProps = {
  manualScaler?: number;
  selectedId?: RefObject<setSelectedIdType>;
  previewStyle: boolean;
  editQuestionButtonHandler?: (passedPage?: number, passedGroupID?: number) => void;
  actionWindow?: boolean;
};

type setSelectedIdType = {
  groupID: number | null;
  page: number | null;
  transformerRef: React.RefObject<Konva.Transformer | null>;
};

const AllStages = ({ manualScaler=1, selectedId=useRef<setSelectedIdType>({groupID: null, page: null, transformerRef: useRef(null)}), previewStyle, editQuestionButtonHandler, actionWindow=undefined } : AllStagesProps) => {
  const [stages, setStages] = useState(getStages());
  const pageElements = useMemo(() => getPageElements(), [stages]);
  const pageElementsInfo = useMemo(() => getPageElementsInfo(), [stages]);

  const wholeContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

  const [stageEstimatedPage, setStageEstimatedPage] = useState(getEstimatedPage());
  const [stagePreviewEstimatedPage, setStagePreviewEstimatedPage] = useState(0);

  const [showSelectButtons, setShowSelectButtons] = useState(false);
  const [expandSelectButtons, setExpandSelectButtons] = useState(false);
  const [selectButtonPosition, setSelectButtonPosition] = useState({ x: 0, y: 0, widestX: 0, widestY: 0 });

  const { notify } = useNotification();

  useEffect(() => {
    if (selectedId.current.groupID === null || selectedId.current.page === null) {
      setShowSelectButtons(false);
      setExpandSelectButtons(false);
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
  }, [previewStyle]);

  useEffect(() => {
    if (!previewStyle) {
      const unsubscribeStage = subscribeStage(() => {
        console.log('Stage update triggered');
        setStages(getStages());
      });
      return () => unsubscribeStage();
    }
  }, [previewStyle]);

  useEffect(() => {
    const handleScroll = () => {
      if (stages.length === 0) {
        if (previewStyle) {
          setStagePreviewEstimatedPage(0);
        } else {
          setStageEstimatedPage(0);
          setEstimatedPage(0);
        }
        return;
      }
      const el = wholeContainerRef.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;

      const scrollValue = (scrollTop / (scrollHeight - clientHeight));
      const estimatedPageCal = Math.min(Math.floor(scrollValue * stages.length), stages.length-1);
      if (previewStyle) {
        setStagePreviewEstimatedPage(isNaN(estimatedPageCal) ? 0 : estimatedPageCal);
      } else {
        setStageEstimatedPage(isNaN(estimatedPageCal) ? 0 : estimatedPageCal);
        setEstimatedPage(isNaN(estimatedPageCal) ? 0 : estimatedPageCal);
      }
    };

    const el = wholeContainerRef.current;
    if (el) el.addEventListener('scroll', handleScroll);

    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };

  }, [stages, previewStyle]);
  
  const marginValue = getMarginValue();
  const viewMargin = getViewMargin();
  
  const stageRefs = useRef<React.RefObject<Konva.Stage | null>[]>([]);
  const transformerRefs = useRef<React.RefObject<Konva.Transformer | null>[]>([]);

  while (stageRefs.current.length < stages.length) {
    stageRefs.current.push(React.createRef<Konva.Stage | null>());
    transformerRefs.current.push(React.createRef<Konva.Transformer | null>());
  }

  stages.forEach((stage, stageIndex) => {
    stage.stageRef = stageRefs.current[stageIndex];
    stage.transformerRef = transformerRefs.current[stageIndex];
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

  /*
  const selectButtonDeleteHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null) {
      deletePageElement(selectedId.page, selectedId.groupID);
      deletePageElementInfo(selectedId.page, selectedId.groupID);
    }
    setSelectedId?.({groupID: null, page: null});
    RENDER_PREVIEW();
  }

  const duplicateQuestionButtonHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null){
      duplicatePageElementsInfo(selectedId.page, selectedId.groupID);
      duplicatePageElement(selectedId.page, selectedId.groupID);
      RENDER_PAGE();
      setSelectedId?.({groupID: null, page: null});
    } else {
      notify('info', 'Please select an element');
    }
  }

  const selectButtonMoveDownElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page < stages.length-1) {
      changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page+1);
      changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page+1);
      console.log(groupsOnPage(selectedId.page+1)-1);
      setSelectedId?.({groupID: groupsOnPage(selectedId.page+1)-1, page: selectedId.page+1});
      RENDER_PAGE();
    } else {
      notify('info', 'No page bellow');
    }
  }

  const selectButtonMoveUpElementHandler = () => {
    if (selectedId.page !== null && selectedId.groupID !== null && selectedId.page > 0) {
      changePageOfElement(selectedId.page, selectedId.groupID, selectedId.page-1);
      changePageOfElementInfo(selectedId.page, selectedId.groupID, selectedId.page-1);
      console.log(groupsOnPage(selectedId.page-1)-1);
      setSelectedId?.({groupID: groupsOnPage(selectedId.page-1)-1, page: selectedId.page-1});
      RENDER_PAGE();
    } else {
      notify('info', 'No page above');
    }
  }
  */

  let aPagesElements: ShapeData[][] | null;

  const [selectButtonOffset, setSelectButtonOffset] = useState<{ x: number; y: number }>({x: 0, y: 0});

  const updateOffset = () => {
    if (stageContainerRef.current && stageWrapRef.current) {
      const rectOutside = stageContainerRef.current.getBoundingClientRect();
      const rectInside = stageWrapRef.current.getBoundingClientRect();

      const x = rectInside.left - rectOutside.left;
      const y = rectInside.top - rectOutside.top;

      setSelectButtonOffset({ x, y });
    }
  };

  const [pagesInsightValue, setPagesInsightValue] = useState<number>(1);
  const [pagesInsightValuePreview, setPagesInsightValuePreview] = useState<number>(1);
  const preloadAhead = 1;

  const calculatePagesInsight = () => {
    if (wholeContainerRef.current) {
      const viewSize = wholeContainerRef.current.getBoundingClientRect();
      const displayDimension = minWidthHeight();

      const previewScale = (wholeContainerRef.current.clientWidth - 32) / displayDimension.minHeight;
      const previewPagesInsight = Math.floor(viewSize.height / (displayDimension.minHeight * previewScale));
      setPagesInsightValuePreview(isNaN(previewPagesInsight) ? 3 : (previewPagesInsight+1));

      const scale = (wholeContainerRef.current.clientWidth - 64) / displayDimension.minHeight;
      const pagesInsight = Math.floor(viewSize.height / (displayDimension.minHeight * scale * manualScaler));
      setPagesInsightValue(isNaN(pagesInsight) ? 1 : pagesInsight);
    }
  }

  const windowResizedFunctions = () => {
    updateOffset();
    calculatePagesInsight();
  }

  useEffect(() => {
    const id = requestAnimationFrame(updateOffset);
    return () => cancelAnimationFrame(id);
  }, [])

  useEffect(() => {
    windowResizedFunctions();

    window.addEventListener('resize', windowResizedFunctions);
    return () => window.removeEventListener('resize', windowResizedFunctions);
  }, []);

  useEffect(() => {
    updateOffset();
  }, [actionWindow]);







  
  const handleShapesChange = useCallback(
    (pageIndex: number, updatedShapes: ShapeData[]) => {
      setAllShapes((prev) => ({
        ...prev,
        [pageIndex]: updatedShapes,
      }));
    },
    []
  );

  const range = (previewStyle ? pagesInsightValuePreview : pagesInsightValue) + preloadAhead;
  const pageOn = (previewStyle ? stagePreviewEstimatedPage : stageEstimatedPage);

  return (
    <>
    {true && (() => {console.log(previewStyle ? "Preview Render Called" : "Main Render Called");})()}
    <div 
      ref={wholeContainerRef}
      className='overflow-auto relative custom-scroll h-full w-full flex flex-col items-center justify-start space-y-2 p-4'
      id={!previewStyle ? `wholeStageContainerScroller` : ''}
      onClick={(e) => {
        if (!previewStyle && e.target === e.currentTarget) {
          selectedId.current.transformerRef?.current?.nodes([]);
          selectedId.current.transformerRef?.current?.getLayer()?.batchDraw();
          selectedId.current = {groupID: null, page: null, transformerRef: nullTransformerRef};
        }
      }}
      >
      {stages.map((stage, pageNumber) => {
        const container = wholeContainerRef.current;
        let displayDimension;
        if (!previewStyle) {
          displayDimension = maxWidthHeight();
        } else {
          displayDimension = {maxWidth: stage.width, maxHeight: stage.height}
        }
        const manualPadding = previewStyle ?  32 : 64;
        const scale = container 
          ? Math.min(
              (container.clientWidth - manualPadding) / (displayDimension.maxWidth),
              (container.clientHeight - manualPadding) / (displayDimension.maxHeight)
            )
          : 1;
        
        if (pageOn-range <= pageNumber && pageOn+range >= pageNumber) {
          aPagesElements = pageElements.slice(pageNumber, pageNumber+1)[0];
          if (!aPagesElements) {
            aPagesElements = null;
          }
        } else {
          aPagesElements = null;
        }
        
        //aPagesElements = pageElements[pageNumber];

        //console.log(`Rending Page ${pageNumber+1}#, Items: ${aPagesElements.length}`);
        return (
          <div key={stage.id+"wrap"} className='flex flex-col items-center justify-start' id={!previewStyle ? `stageDivSelect${pageNumber}` : ''}>
          {!previewStyle && (
            <p 
              key={stage.id+"p"}
              className='flex w-full items-center justify-center text-darkGrey text-[0.6rem] text-center select-none cursor-default'
              onClick={(e) => {
                  if (!previewStyle && e.target === e.currentTarget) {
                    selectedId.current.transformerRef?.current?.nodes([]);
                    selectedId.current.transformerRef?.current?.getLayer()?.batchDraw();
                    selectedId.current = {groupID: null, page: null, transformerRef: nullTransformerRef};
                  }
                }}
              >{stage.width}px x {stage.height}px</p>
          )}
          <div ref={stageContainerRef} key={stage.id+"div"} onClick={() => previewPageOnClickHanlder?.(pageNumber)} className='flex flex-col relative w-full h-full items-center justify-start'>
              <div
                ref={stageWrapRef}
                className={`flex flex-shrink-0 ${previewStyle && `border border-primary rounded-sm transition-shadow duration-300 hover:shadow-[0_0_0_0.2rem_theme('colors.contrast')]`} overflow-hidden`}
                style={{
                  width: stage.width * scale * manualScaler,
                  height: stage.height * scale * manualScaler,
                  transformOrigin: 'top left',
                }}
              >
              {aPagesElements !== null && !previewStyle && (
                <KonvaPage 
                  key={pageNumber}
                  stage={stage}
                  stageScale={scale}
                  manualScaler={manualScaler}
                  pageNumber={pageNumber}
                  viewMargin={viewMargin}
                  shapesInit={aPagesElements}
                  shapesInfoInit={pageElementsInfo[pageNumber]}
                />
              )}
            </div>
            {previewStyle && (
              <p key={stage.id+"previewPageNumber"} className='flex text-primary text-[0.8rem] text-left pt-1'>{pageNumber+1}</p>
            )}
            {/*!previewStyle && showSelectButtons && selectedId.page === pageNumber && ( () => {
              const marginSpace = 4;
              const oneOverTwoValue = 1/2;
              const topPosition = ((selectButtonPosition.y + (selectButtonPosition.widestY*oneOverTwoValue)) < (stage.height * scale)*oneOverTwoValue) ? selectButtonOffset.y + selectButtonPosition.y + selectButtonPosition.widestY + marginSpace : selectButtonOffset.y + selectButtonPosition.y - marginSpace;
              const leftPosition = ((selectButtonPosition.x + (selectButtonPosition.widestX*oneOverTwoValue)) <= (stage.width * scale)*oneOverTwoValue) ? selectButtonOffset.x + selectButtonPosition.x + selectButtonPosition.widestX + marginSpace : selectButtonOffset.x + selectButtonPosition.x - marginSpace;
              const transformFrom = (((selectButtonPosition.y + (selectButtonPosition.widestY*oneOverTwoValue)) <= (stage.height * scale)*oneOverTwoValue) ? "top" : "bottom") + " " + (((selectButtonPosition.x + (selectButtonPosition.widestX*oneOverTwoValue)) <= (stage.width * scale)*oneOverTwoValue) ? "left" : "right");
              const translateX = ((selectButtonPosition.x + (selectButtonPosition.widestX*oneOverTwoValue)) <= (stage.width * scale)*oneOverTwoValue) ? "0%" : "-100%";
              const translateY = ((selectButtonPosition.y + (selectButtonPosition.widestY*oneOverTwoValue)) <= (stage.height * scale)*oneOverTwoValue) ? "0%" : "-100%";
              return (
                <div className='absolute inline-flex w-max bg-background border border-darkGrey rounded-sm items-center justify-center shadow z-20'
                  style={{
                    top: topPosition,
                    left: leftPosition,
                    transformOrigin: transformFrom,
                    transform: `translate(${translateX}, ${translateY})`,
                  }}
                  ref={selectButtonsDivRef}
                >
                  { !expandSelectButtons ? (
                    <>
                      <button className='w-5 h-5 p-0.25' onClick={() => setExpandSelectButtons(true)}>
                        <svg clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org*oneOverTwoValue000/svg"><path d="m12 16.495c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25zm0 1.5c.414 0 .75.336.75.75s-.336.75-.75.75-.75-.336-.75-.75.336-.75.75-.75zm0-8.25c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25zm0 1.5c.414 0 .75.336.75.75s-.336.75-.75.75-.75-.336-.75-.75.336-.75.75-.75zm0-8.25c1.242 0 2.25 1.008 2.25 2.25s-1.008 2.25-2.25 2.25-2.25-1.008-2.25-2.25 1.008-2.25 2.25-2.25zm0 1.5c.414 0 .75.336.75.75s-.336.75-.75.75-.75-.336-.75-.75.336-.75.75-.75z"/></svg>
                      </button>
                    </>
                  ) : (
                    <div className='flex flex-col text-xs text-primary'>
                      <button onClick={duplicateQuestionButtonHandler} className='flex items-center justify-start p-1'>
                        <svg className='w-4 h-4 items-center justify-center' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org*oneOverTwoValue000/svg"><path d="m20 20h-15.25c-.414 0-.75.336-.75.75s.336.75.75.75h15.75c.53 0 1-.47 1-1v-15.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75zm-1-17c0-.478-.379-1-1-1h-15c-.62 0-1 .519-1 1v15c0 .621.52 1 1 1h15c.478 0 1-.379 1-1zm-15.5.5h14v14h-14zm6.25 6.25h-3c-.414 0-.75.336-.75.75s.336.75.75.75h3v3c0 .414.336.75.75.75s.75-.336.75-.75v-3h3c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3v-3c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>
                        <p className='ml-1'>Duplicate</p>
                      </button>
                      <button onClick={selectButtonMoveUpElementHandler} className='flex items-center justify-start p-1'>
                        <svg className='w-4 h-4 items-center justify-center' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org*oneOverTwoValue000/svg"><path d="M12.0894 3.17889L20.9276 20.8553C20.9609 20.9218 20.9125 21 20.8382 21L3.1618 21C3.08747 21 3.03912 20.9218 3.07236 20.8553L11.9106 3.17889C11.9474 3.10518 12.0526 3.10518 12.0894 3.17889Z" stroke="black" strokeWidth="2"/></svg>
                        <p className='ml-1'>Up page</p>
                      </button>
                      <button onClick={selectButtonMoveDownElementHandler} className='flex items-center justify-start p-1'>
                        <svg className='w-4 h-4 items-center justify-center' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org*oneOverTwoValue000/svg"><path d="M11.9106 21.8211L3.07236 4.14472C3.03912 4.07823 3.08747 4 3.1618 4H20.8382C20.9125 4 20.9609 4.07823 20.9276 4.14472L12.0894 21.8211C12.0526 21.8948 11.9474 21.8948 11.9106 21.8211Z" stroke="black" strokeWidth="2"/></svg>
                        <p className='ml-1'>Down page</p>
                      </button>
                      <button onClick={selectButtonDeleteHandler} className='flex items-center justify-start p-1'>
                        <svg className='w-4 h-4 items-center justify-center' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org*oneOverTwoValue000/svg"><path d="M4 20L20 4M4 4L20 20" stroke="black" strokeWidth="1.5"/></svg>
                        <p className='ml-1'>Delete</p>
                      </button>
                    </div>
                  )}
                </div>
          )})()*/}
          </div>
          </div>
        );
      })}
      <div className='w-full h-4 m-0' />
    </div>
    {!previewStyle && (
      <div className='absolute bg-gray-600 opacity-50 bottom-2 px-2 py-1'>
        <p className='text-white'>{stageEstimatedPage+1} / {stages.length}</p>
      </div>
    )}
    </>
  );
}

export default React.memo(AllStages);