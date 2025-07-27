import {ShapeData} from '@/lib/shapeData'
import Konva from 'konva';

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
};


let stages: StageData[] = [];
let stageListeners: (() => void)[] = [];
let previewStageListeners: (() => void)[] = [];
let viewMargin: boolean = false;
let marginValue: number = 300;
let globalStageScale: number;
let pageElements: ShapeData[][][] = [];
let pageElementsInfo: stageGroupInfoData[][] = [];
let estimatedPage: number = 0;

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

export function deleteAll() {
  stages = [];
  pageElements = [];
  pageElementsInfo = [];
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

export function setGlobalStageScale(newStageScale: number) {
  globalStageScale = newStageScale;
}

export function getGlobalStageScale(): number {
  return globalStageScale;
}

//////////////////////////////////////////////////////////////

export function getPageElements(): ShapeData[][][] {
  return [...pageElements];
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

export function getEstimatedPage():number {
  return estimatedPage;
}

export function setEstimatedPage(page: number) {
  estimatedPage = page
}