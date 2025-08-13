// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import {ShapeData} from '@/lib/shapeData'
import Konva from 'konva';
import { Stage } from 'konva/lib/Stage';

export type StageData = {
  id: string;
  width: number;
  height: number;
  background: string;
  stageRef?: React.RefObject<Konva.Stage | null>;
};

export type stageGroupInfoData = {
  widestX: number;
  widestY: number;
  x: number;
  y: number;
  rotation: number;
};

export type selectIndexData = {
  pageIndex: number | null;
  groupIndex: number | null;
}


export type historyData = {
  command: string;
  data: ShapeData[];
}

const stages: StageData[] = [];
let stageListeners: (() => void)[] = [];
let previewStageListeners: (() => void)[] = [];
let viewMargin: boolean = false;
let marginValue: number = 300;
export const pageElements: ShapeData[][][] = [];
export const pageElementsInfo: stageGroupInfoData[][] = [];
const globalSelectIndex: selectIndexData = {pageIndex: null, groupIndex: null};
let estimatedPage: number = 0;
const stageHistoryUndo: historyData[] = [];
const stageHistoryRedo: historyData[] = [];
const stageHistoryLimit = 50;
export const newShapeSizePercent = 0.1;

export function RENDER_PAGE() {
  console.log("Call to render");
  stageListeners.forEach((fn) => fn());
  previewStageListeners.forEach((fn) => fn());
}

export function RENDER_MAIN() {
  console.log("Call to render");
  stageListeners.forEach((fn) => fn());
}

export function RENDER_PREVIEW() {
  console.log("Call to render");
  previewStageListeners.forEach((fn) => fn());
}

export function subscribeStage(listener: () => void) {
  stageListeners.push(listener);
  return () => {
    stageListeners = stageListeners.filter((fn) => fn !== listener);
  };
}

export function subscribePreviewStage(listener: () => void) {
  previewStageListeners.push(listener);
  return () => {
    previewStageListeners = previewStageListeners.filter((fn) => fn !== listener);
  };
}

export function addStage(stage: StageData) {
  stages.push(stage);
  pageElements.push([]);
  pageElementsInfo.push([]);
}

export function getStageDimension(): { width: number; height: number } {
  return {width: stages[0].width, height: stages[0].height}
}

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
    }
}

export function getStages(): StageData[] {
  return [...stages];
}

export function getSpecificStage(pageIndex: number): StageData {
  return stages[pageIndex];
}

export function deleteAll() {
  stages.length = 0;
  pageElements.length = 0;
  pageElementsInfo.length = 0;
}

export function stagesLength() {
    return stages.length;
}

export function maxWidthHeight() {
  let maxWidth = 0;
  let maxHeight = 0;

  for (const stage of stages) {
    if (stage.width > maxWidth) maxWidth = stage.width;
    if (stage.height > maxHeight) maxHeight = stage.height;
  }
  
  return {maxWidth, maxHeight};
}

export function minWidthHeight() {
  let minWidth = Infinity;
  let minHeight = Infinity;

  for (const stage of stages) {
    if (stage.width < minWidth) minWidth = stage.width;
    if (stage.height < minHeight) minHeight = stage.height;
  }
  
  return {minWidth, minHeight};
}

export function getStagesBackground():string {
  if (stages.length !== 0){
    return stages[0].background;
  }
  return '';
}

export function setAllStagesBackground(newBackground:string) {
  stages.forEach(stage => {
    stage.background = newBackground;
  });
}

//////////////////////////////////////////////////////////////

export function getMarginValue(): number {
  return marginValue;
}

export function setMarginValue(newMarginValue: number) {
  marginValue = newMarginValue;
}

export function getViewMargin(): boolean {
  return viewMargin;
}

export function setViewMargin(newMarginStage: boolean) {
  viewMargin = newMarginStage;
}

//////////////////////////////////////////////////////////////

export function getPageElements(): ShapeData[][][] {
  return [...pageElements];
}

export function setAllPageElements(newShapeData: ShapeData[][][]) {
  pageElements.length = 0;
  pageElements.push(...newShapeData);
}

export function getPageGroup(page: number, groupID: number): ShapeData[] {
  return [...pageElements[page][groupID]];
}

export function addPageElement(newShape: ShapeData[], page:number) {
  pageElements[page].push(newShape);
}

export function duplicatePageElement(page: number, groupID: number) {
  pageElements[page].push(pageElements[page][groupID]);
}

export function setPageElement(newShape: ShapeData[], page: number, groupID: number) {
  pageElements[page][groupID] = newShape;
}

export function setPageElementWidth(newWidth: number, page: number, groupID: number, index: number) {
  console.log(page + "-" + groupID + "-" + index);
  const shape = pageElements[page][groupID][index];
  console.log(shape);
  shape.width = newWidth;
}

export function setPageElementHeight(newHeight: number, page: number, groupID: number, index: number) {
  const shape = pageElements[page][groupID][index];
  shape.height = newHeight;

}

export function deletePageElement(page: number, groupID: number) {
  pageElements[page].splice(groupID, 1);
}

export function changePageOfElement(page: number, groupID: number, newPage: number) {
  const arrayToMove = pageElements[page][groupID];
  pageElements[page].splice(groupID, 1);
  pageElements[newPage].push(arrayToMove);
}

//////////////////////////////////////////////////////////////

export function getPageElementsInfo(): stageGroupInfoData[][] {
  return [...pageElementsInfo];
}

export function setAllPageElementsInfo(newShapeInfoData: stageGroupInfoData[][]) {
  pageElementsInfo.length = 0;
  pageElementsInfo.push(...newShapeInfoData);
}


export function getSpecificPageElementsInfo(page: number, groupID: number): stageGroupInfoData {
  return pageElementsInfo[page][groupID];
}

export function addPageElementsInfo(newStageGroupInfo: stageGroupInfoData, page:number) {
  pageElementsInfo[page].push(newStageGroupInfo);
}

export function duplicatePageElementsInfo(page: number, groupID: number) {
  const original = pageElementsInfo[page][groupID];
  const copy = { ...original }; // shallow clone
  copy.x = 0;
  copy.y = 0;

  pageElementsInfo[page].push(copy);
  console.log(pageElementsInfo);
}

export function setPageElementsInfo(newStageGroupInfo: stageGroupInfoData, page: number, groupID: number) {
  pageElementsInfo[page][groupID] = newStageGroupInfo;
}

export function setPageElementsInfoWidth(newWidestX: number, page: number, groupID: number) {
  pageElementsInfo[page][groupID].widestX = newWidestX;
}

export function setPageElementsInfoHeight(newWidestY: number, page: number, groupID: number) {
  pageElementsInfo[page][groupID].widestY = newWidestY;
}

export function deletePageElementInfo(page: number, groupID: number) {
  pageElementsInfo[page].splice(groupID, 1);
}

export function changePageOfElementInfo(page: number, groupID: number, newPage: number) {
  const arrayToMove = pageElementsInfo[page][groupID];
  pageElementsInfo[page].splice(groupID, 1);
  pageElementsInfo[newPage].push(arrayToMove);
}

export function groupsOnPage(page: number) {
  return pageElementsInfo[page].length;
}

//////////////////////////////////////////////////////////////

export function getGlobalSelectIndex():selectIndexData {
  return globalSelectIndex;
}

export function setGlobalSelectIndex(pageIndex: number | null, groupIndex: number | null) {
  globalSelectIndex.pageIndex = pageIndex;
  globalSelectIndex.groupIndex = groupIndex;

}

//////////////////////////////////////////////////////////////

export function getEstimatedPage():number {
  return estimatedPage;
}

export function setEstimatedPage(page: number) {
  estimatedPage = page;
}

//////////////////////////////////////////////////////////////

export function addToHistoryUndo(past: historyData) {
  stageHistoryUndo.push(past);
  if (stageHistoryUndo.length > stageHistoryLimit) {
    stageHistoryUndo.pop();
  }
}

export function addToHistoryRedo(future: historyData) {
  stageHistoryRedo.push(future);
}