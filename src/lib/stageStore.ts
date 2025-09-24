// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import {ShapeData} from '@/lib/shapeData';
import Konva from 'konva';

export type StageData = {
  id: string;
  width: number;
  height: number;
  background: string;
  stageRef?: React.RefObject<Konva.Stage | null>;
  transformerRef?: React.RefObject<Konva.Transformer | null>
};

export type stageGroupInfoData = {
  id: string;
  widestX: number;
  widestY: number;
  x: number;
  y: number;
  rotation: number;
};

export type historyData = {
  command: string;
  from: stageGroupInfoData;
  to: stageGroupInfoData;
  pageIndex: number;
  groupIndex: number;
  contentsFrom?: ShapeData[];
  contentsTo?: ShapeData[];
};

const stages: StageData[] = [];
let stageListeners: (() => void)[] = [];
let previewStageListeners: (() => void)[] = [];
let viewMargin: boolean = false;
let marginValue: number = 300;
export const pageElements: ShapeData[][][] = [];
export const pageElementsInfo: stageGroupInfoData[][] = [];
let estimatedPage: number = 0;
const stageHistoryUndo: historyData[] = [];
const stageHistoryRedo: historyData[] = [];
const stageHistoryLimit = 50;
export const newShapeSizePercent = 0.1;

export function RENDER_PAGE() {
  //console.log("Call to render");
  stageListeners.forEach((fn) => fn());
  previewStageListeners.forEach((fn) => fn());
};

export function RENDER_MAIN() {
  //console.log("Call to render");
  stageListeners.forEach((fn) => fn());
};

export function RENDER_PREVIEW() {
  //console.log("Call to render");
  previewStageListeners.forEach((fn) => fn());
};

export function subscribeStage(listener: () => void) {
  stageListeners.push(listener);
  return () => {
    stageListeners = stageListeners.filter((fn) => fn !== listener);
  };
};

export function subscribePreviewStage(listener: () => void) {
  previewStageListeners.push(listener);
  return () => {
    previewStageListeners = previewStageListeners.filter((fn) => fn !== listener);
  };
};

export function addStage(stage: StageData) {
  stages.push(stage);
  pageElements.push([]);
  pageElementsInfo.push([]);
};

export function getStageDimension(): { width: number; height: number } {
  return {width: stages[0].width, height: stages[0].height}
};

export function addStageCopyPrevious(id: string) {
    const lastStage = stages.length > 0 ? stages[stages.length - 1] : null;
    if (lastStage !== null){
        stages.push({
            id: id,
            width: lastStage.width,
            height: lastStage.height,
            background: lastStage.background,
        });
        pageElements.push([]);
        pageElementsInfo.push([]);
    } else {
      const width = Number(2480);
      const height = Number(3508);
      const backgroundColor = '#ffffff';
      
      stages.push({
            id: id,
            width: width,
            height: height,
            background: backgroundColor,
        });
        pageElements.push([]);
        pageElementsInfo.push([]);
    }
}

export function getStages(): StageData[] {
  return [...stages];
};

export function getSpecificStage(pageIndex: number): StageData {
  return stages[pageIndex];
};

export function deleteAll() {
  stages.length = 0;
  pageElements.length = 0;
  pageElementsInfo.length = 0;
}

export function stagesLength() {
    return stages.length;
};

export function maxWidthHeight() {
  let maxWidth = 0;
  let maxHeight = 0;

  for (const stage of stages) {
    if (stage.width > maxWidth) maxWidth = stage.width;
    if (stage.height > maxHeight) maxHeight = stage.height;
  }
  
  return {maxWidth, maxHeight};
};

export function minWidthHeight() {
  let minWidth = Infinity;
  let minHeight = Infinity;

  for (const stage of stages) {
    if (stage.width < minWidth) minWidth = stage.width;
    if (stage.height < minHeight) minHeight = stage.height;
  }
  
  return {minWidth, minHeight};
};

export function setStageBackground(page: number, newBackground: string) {
  stages[page].background = newBackground;
}

export function setAllStagesBackground(newBackground: string) {
  stages.forEach(stage => {
    stage.background = newBackground;
  });
};

//////////////////////////////////////////////////////////////

export function getMarginValue(): number {
  return marginValue;
};

export function setMarginValue(newMarginValue: number) {
  marginValue = newMarginValue;
};

export function getViewMargin(): boolean {
  return viewMargin;
};

export function setViewMargin(newMarginStage: boolean) {
  viewMargin = newMarginStage;
};

//////////////////////////////////////////////////////////////

export function getPageElements(): ShapeData[][][] {
  return [...pageElements];
};

export function setAllPageElements(newShapeData: ShapeData[][][]) {
  pageElements.length = 0;
  pageElements.push(...newShapeData);
};

export function getPageGroup(page: number, groupID: number): ShapeData[] {
  return [...pageElements[page][groupID]];
};

export function addPageElement(newShape: ShapeData[], page:number) {
  pageElements[page].push(newShape);
};

export function duplicatePageElement(page: number, groupID: number) {
  const duplicateElements = [...pageElements[page][groupID]]
  for (let x = 0; x < duplicateElements.length; x++) {
    duplicateElements[x].id = String(Date.now()+x);
  }
  pageElements[page].push(duplicateElements);
};

export function setPageElement(newShape: ShapeData[], page: number, groupID: number) {
  pageElements[page][groupID] = newShape;
};

export function setPageElementWidth(newWidth: number, page: number, groupID: number, index: number) {
  //console.log(page + "-" + groupID + "-" + index);
  const shape = pageElements[page][groupID][index];
  //console.log(shape);
  shape.width = newWidth;
};

export function setPageElementHeight(newHeight: number, page: number, groupID: number, index: number) {
  const shape = pageElements[page][groupID][index];
  shape.height = newHeight;
};

export function deletePageElement(page: number, groupID: number) {
  pageElements[page].splice(groupID, 1);
};

export function changePageOfElement(page: number, groupID: number, newPage: number) {
  const arrayToMove = pageElements[page][groupID];
  pageElements[page].splice(groupID, 1);
  pageElements[newPage].push(arrayToMove);
};

//////////////////////////////////////////////////////////////

export function getPageElementsInfo(): stageGroupInfoData[][] {
  return [...pageElementsInfo];
};

export function setAllPageElementsInfo(newShapeInfoData: stageGroupInfoData[][]) {
  pageElementsInfo.length = 0;
  pageElementsInfo.push(...newShapeInfoData);
};


export function getSpecificPageElementsInfo(page: number, groupID: number): stageGroupInfoData {
  return pageElementsInfo[page][groupID];
};

export function addPageElementsInfo(newStageGroupInfo: stageGroupInfoData, page:number) {
  pageElementsInfo[page].push(newStageGroupInfo);
};

export function duplicatePageElementsInfo(page: number, groupID: number) {
  const original = pageElementsInfo[page][groupID];
  const copy = { ...original }; // shallow clone
  copy.id = "g-"+Date.now();
  copy.x = 0;
  copy.y = 0;

  pageElementsInfo[page].push(copy);
  //console.log(pageElementsInfo);
};

export function setPageElementsInfo(newStageGroupInfo: stageGroupInfoData, page: number, groupID: number) {
  pageElementsInfo[page][groupID] = newStageGroupInfo;
};

export function setPageElementsInfoWidth(newWidestX: number, page: number, groupID: number) {
  pageElementsInfo[page][groupID].widestX = newWidestX;
};

export function setPageElementsInfoHeight(newWidestY: number, page: number, groupID: number) {
  pageElementsInfo[page][groupID].widestY = newWidestY;
};

export function deletePageElementInfo(page: number, groupID: number) {
  //console.log(pageElementsInfo);
  //console.log(page + " - " + groupID);
  pageElementsInfo[page].splice(groupID, 1);
};

export function changePageOfElementInfo(page: number, groupID: number, newPage: number) {
  const arrayToMove = pageElementsInfo[page][groupID];
  pageElementsInfo[page].splice(groupID, 1);
  pageElementsInfo[newPage].push(arrayToMove);
};

export function groupsOnPage(page: number) {
  return pageElementsInfo[page].length;
};

//////////////////////////////////////////////////////////////

export function getEstimatedPage():number {
  if (!isNaN(estimatedPage)) {
    return estimatedPage;
  } else {
    return 0;
  }
  
};

export function setEstimatedPage(page: number) {
  if (page !== estimatedPage) { 
    estimatedPage = page;
    window.dispatchEvent(new CustomEvent('newEstimatedPage', {  detail: {page: estimatedPage} }));
  }
};

//////////////////////////////////////////////////////////////

export function deleteStageAndElements(page: number) {
  stages.splice(page, 1);
  pageElements.splice(page, 1);
  pageElementsInfo.splice(page, 1);
}

export function swapStagesAndElements(startIndex: number, endIndex: number) {
  [stages[startIndex], stages[endIndex]] = [stages[endIndex], stages[startIndex]];
  [pageElements[startIndex], pageElements[endIndex]] = [pageElements[endIndex], pageElements[startIndex]];
  [pageElementsInfo[startIndex], pageElementsInfo[endIndex]] = [pageElementsInfo[endIndex], pageElementsInfo[startIndex]];
}

//////////////////////////////////////////////////////////////

export function addToHistoryUndo(past: historyData) {
  stageHistoryUndo.push(past);
  if (stageHistoryUndo.length > stageHistoryLimit) {
    stageHistoryUndo.pop();
  }
  if (stageHistoryRedo.length > 0) {
    stageHistoryRedo.length = 0;
  }
};


export function restoreHistoryUndo() {
  const front = stageHistoryUndo.at(-1);
  
  if (front) {
    if (front.command !== "delete") {
      const {pageIndex, groupIndex} = validateIndexes(front);
      switch (front.command) {
        case "info":
          pageElementsInfo[pageIndex][groupIndex] = front.from;
          window.dispatchEvent(new CustomEvent('shapeOnDrag', { detail: { x: pageElementsInfo[pageIndex][groupIndex].x, y: pageElementsInfo[pageIndex][groupIndex].y, pageID: pageIndex, groupID: groupIndex} }));
          break;
        case "info-contents":
          if (front.contentsFrom){ 
            pageElementsInfo[pageIndex][groupIndex] = front.from;
            pageElements[pageIndex][groupIndex] = front.contentsFrom;
            window.dispatchEvent(new CustomEvent('shapeOnDrag', { detail: { x: pageElementsInfo[pageIndex][groupIndex].x, y: pageElementsInfo[pageIndex][groupIndex].y, pageID: pageIndex, groupID: groupIndex} }));
          }
          break;
        case "create":
          deletePageElementInfo(pageIndex,groupIndex);
          deletePageElement(pageIndex, groupIndex);
          break;
      }
    } else {
      if (front.contentsFrom){ 
        addPageElementsInfo(front.from, front.pageIndex);
        addPageElement(front.contentsFrom, front.pageIndex);
      }
    }
    stageHistoryRedo.push(front);
    stageHistoryUndo.pop();
    RENDER_PAGE();
  }
};

export function restoreHistoryRedo() {
  const front = stageHistoryRedo.at(-1);
  if (front) {
    if (front.command !== "create") { 
      const {pageIndex, groupIndex} = validateIndexes(front);
      switch (front.command) {
        case "info":
          pageElementsInfo[pageIndex][groupIndex] = front.to;
          window.dispatchEvent(new CustomEvent('shapeOnDrag', { detail: { x: pageElementsInfo[pageIndex][groupIndex].x, y: pageElementsInfo[pageIndex][groupIndex].y, pageID: pageIndex, groupID: groupIndex} }));
          break;
        case "info-contents":
          if (front.contentsTo){ 
            pageElementsInfo[pageIndex][groupIndex] = front.to;
            pageElements[pageIndex][groupIndex] = front.contentsTo;
            window.dispatchEvent(new CustomEvent('shapeOnDrag', { detail: { x: pageElementsInfo[pageIndex][groupIndex].x, y: pageElementsInfo[pageIndex][groupIndex].y, pageID: pageIndex, groupID: groupIndex} }));
          }
          break;
        case "delete":
          deletePageElementInfo(pageIndex, groupIndex);
          deletePageElement(pageIndex, groupIndex);
          break;
      }
    } else {
      if (front.contentsTo){ 
        addPageElementsInfo(front.to, front.pageIndex);
        addPageElement(front.contentsTo, front.pageIndex);
      }
      front.groupIndex = pageElementsInfo[front.pageIndex].length-1;
    }
    stageHistoryUndo.push(front);
    stageHistoryRedo.pop();
    RENDER_PAGE();
  }
}

type indexes = {
  pageIndex: number;
  groupIndex: number;
}

const validateIndexes = (data: historyData):indexes => {
  const groupID = data.to !== null && data.to !== undefined ? data.to.id : data.from.id;
  const pageIndex = data.pageIndex;
  const groupIndex = data.groupIndex;
  const focusID = pageElementsInfo[pageIndex][groupIndex];
  if (focusID && groupID === focusID.id) {
    return {pageIndex, groupIndex};
  } else {
    const focusLength = pageElementsInfo[pageIndex].length;
    //console.log(pageElementsInfo[pageIndex]);
    if (groupIndex-1 < focusLength) { 
      for (let x = groupIndex-1; x > -1; x--) {
        if (groupID === pageElementsInfo[pageIndex][x].id) {
          return {pageIndex, groupIndex: x};
        }
      }
      //console.log(pageElementsInfo[pageIndex]);
      for (let x = groupIndex+1; x < focusLength-1; x++) {
        if (groupID === pageElementsInfo[pageIndex][x].id) {
          return {pageIndex, groupIndex: x};
        }
      }
    } else {
      for (let x = focusLength-1; x > -1; x--) {
        if (groupID === pageElementsInfo[pageIndex][x].id) {
          return {pageIndex, groupIndex: x};
        }
      }
    }
    return {pageIndex: -1, groupIndex: -1};
  }
}