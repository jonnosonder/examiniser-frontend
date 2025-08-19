// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { useEffect, useState, useRef, RefObject} from 'react';
import React from "react";
import { getStages, subscribeStage, maxWidthHeight, getEstimatedPage, setEstimatedPage, subscribePreviewStage, minWidthHeight, pageElements, pageElementsInfo, stageGroupInfoData } from '@/lib/stageStore';
import "@/styles/allStages.css"
import Konva from 'konva';
import { ShapeData } from '@/lib/shapeData';
import KonvaPage from './konvaPage';
import KonvaPreviewPage from './konvaPreviewPage';

type AllStagesProps = {
  manualScaler?: number;
  selectedId?: RefObject<setSelectedIdType>;
  previewStyle: boolean;
  editQuestionButtonHandler?: (passedPage?: number, passedGroupID?: number) => void;
};

type setSelectedIdType = {
  groupID: number | null;
  page: number | null;
  transformerRef: React.RefObject<Konva.Transformer | null>;
};

const AllStages = ({ manualScaler=1, previewStyle, editQuestionButtonHandler} : AllStagesProps) => {
  const wholeContainerRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

  const [stages, setStages] = useState(getStages());
  const [allShapes, setAllShapes] = useState<ShapeData[][][]>(pageElements);
  const [allShapesInfo, setAllShapesInfo] = useState<stageGroupInfoData[][]>(pageElementsInfo);
  
  const [stageEstimatedPage, setStageEstimatedPage] = useState(getEstimatedPage());
  const [stagePreviewEstimatedPage, setStagePreviewEstimatedPage] = useState(0);

  useEffect(() => {
    if (previewStyle) {
      const unsubscribeStage = subscribePreviewStage(() => {
        console.log('Preview update triggered');
        setStages(getStages());
        setAllShapes(pageElements);
        setAllShapesInfo(pageElementsInfo);
      });
      return () => unsubscribeStage();
    }
  }, [previewStyle]);

  useEffect(() => {
    if (!previewStyle) {
      const unsubscribeStage = subscribeStage(() => {
        console.log('Stage update triggered');
        setStages(getStages());
        setAllShapes(pageElements);
        setAllShapesInfo(pageElementsInfo);
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

  useEffect(() => {
    calculatePagesInsight();

    window.addEventListener('resize', calculatePagesInsight);
    return () => window.removeEventListener('resize', calculatePagesInsight);
  }, []);

  let aPagesElements: ShapeData[][] | null;
  const range = (previewStyle ? pagesInsightValuePreview : pagesInsightValue) + preloadAhead;
  const pageOn = (previewStyle ? stagePreviewEstimatedPage : stageEstimatedPage);

  return (
    <>
    {true && (() => {console.log(previewStyle ? "Preview Render Called" : "Main Render Called");})()}
    <div 
      ref={wholeContainerRef}
      className='overflow-auto relative custom-scroll h-full w-full flex flex-col items-center justify-start space-y-2 p-4'
      id={!previewStyle ? `wholeStageContainerScroller` : ''}
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
          aPagesElements = allShapes.slice(pageNumber, pageNumber+1)[0];
          if (!aPagesElements) {
            aPagesElements = null;
          }
        } else {
          aPagesElements = null;
        }
        
        //aPagesElements = pageElements[pageNumber];

        //console.log(`Rending Page ${pageNumber+1}#, Items: ${aPagesElements.length}`);
        return (
          <div key={stage.id+"wrap"} className='flex flex-col flex-shrink-0 items-center justify-start' id={!previewStyle ? `stageDivSelect${pageNumber}` : ''}>
          {!previewStyle && (
            <p 
              key={stage.id+"p"}
              className='flex w-full items-center justify-center text-darkGrey text-[0.6rem] text-center select-none cursor-default'
              >{stage.width}px x {stage.height}px</p>
          )}
          <div ref={stageContainerRef} key={stage.id+"div"} onClick={() => previewPageOnClickHanlder?.(pageNumber)} className='flex flex-col flex-shrink-0 relative w-full h-full items-center justify-start'>
              <div
                ref={stageWrapRef}
                className={`flex flex-shrink-0 ${previewStyle && `border border-primary rounded-sm transition-shadow duration-300 hover:shadow-[0_0_0_0.2rem_theme('colors.contrast')]`} overflow-hidden`}
                style={{
                  width: stage.width * scale * manualScaler,
                  height: stage.height * scale * manualScaler,
                  transformOrigin: 'top left',
                }}
              >
              {aPagesElements !== null && ( !previewStyle && editQuestionButtonHandler ? (
                <KonvaPage 
                  key={pageNumber}
                  stage={stage}
                  stageScale={scale}
                  manualScaler={manualScaler}
                  pageIndex={pageNumber}
                  pageGroups={[...aPagesElements]}
                  pageGroupsInfo={[...allShapesInfo[pageNumber]]}
                  editQuestionButtonHandler={editQuestionButtonHandler}
                />
              ) : (
                <KonvaPreviewPage 
                  key={pageNumber}
                  stage={stage}
                  stageScale={scale}
                  manualScaler={manualScaler}
                  pageIndex={pageNumber}
                  pageGroups={[...aPagesElements]}
                  pageGroupsInfo={[...allShapesInfo[pageNumber]]}
                />
              ))}
            </div>
            {previewStyle && (
              <p key={stage.id+"previewPageNumber"} className='flex text-primary text-[0.8rem] text-left pt-1'>{pageNumber+1}</p>
            )}
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

export default AllStages;