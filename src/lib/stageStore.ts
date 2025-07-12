import {ShapeData} from '@/lib/shapeData'
import Konva from 'konva';

export type StageData = {
  id: string;
  width: number;
  height: number;
  background: string;
  stageRef?: React.RefObject<Konva.Stage | null>;
};

let stages: StageData[] = [];
let stageListeners: (() => void)[] = [];
let stageGroup: ShapeData[][] = [];
let groupListeners: (() => void)[] = [];
let viewMargin: boolean = false;
let marginValue: number = 300;
let globalStageScale: number;

export function addStage(stage: StageData) {
  stages.push(stage);
  stageListeners.forEach((fn) => fn());
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
        stageListeners.forEach((fn) => fn());
    }
}

export function getStages(): StageData[] {
  return [...stages];
}

export function subscribeStage(listener: () => void) {
  stageListeners.push(listener);
  return () => {
    stageListeners = stageListeners.filter((fn) => fn !== listener);
  };
}

export function deleteAllStages() {
    stages = [];
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
  stageListeners.forEach((fn) => fn());
}

//////////////////////////////////////////////////////////////

export function getGroups(): ShapeData[][] {
  return [...stageGroup];
}

export function deleteAllGroups() {
    stageGroup = [];
}

export function addGroup(elements: ShapeData[]) {
  stageGroup.push(elements);
  groupListeners.forEach((fn) => fn());
}

export function setGroup(newShape: ShapeData[], index: number) {
  stageGroup[index] = newShape;
  groupListeners.forEach((fn) => fn());
}

export function subscribeGroup(listener: () => void) {
  groupListeners.push(listener);
  return () => {
    groupListeners = groupListeners.filter((fn) => fn !== listener);
  };
}

//////////////////////////////////////////////////////////////

export function getMarginValue(): number {
  return marginValue;
}

export function setMarginValue(newMarginValue: number) {
  marginValue = newMarginValue;
  stageListeners.forEach((fn) => fn());
}

export function getViewMargin(): boolean {
  return viewMargin;
}

export function setViewMargin(newMarginStage: boolean) {
  viewMargin = newMarginStage;
  stageListeners.forEach((fn) => fn());
}

//////////////////////////////////////////////////////////////

export function setGlobalStageScale(newStageScale: number) {
  globalStageScale = newStageScale;
}

export function getGlobalStageScale(): number {
  return globalStageScale;
}