
export type StageData = {
  id: string;
  width: number;
  height: number;
};

let stages: StageData[] = [];
let listeners: (() => void)[] = [];

export function addStage(stage: StageData) {
  stages.push(stage);
  listeners.forEach((fn) => fn());
}

export function addStageCopyPrevious(id: string) {
    const lastStage = stages.length > 0 ? stages[stages.length - 1] : null;
    if (lastStage != null){
        stages.push({
            id: id,
            width: lastStage.width,
            height: lastStage.height,
        });
        listeners.forEach((fn) => fn());
    }
}

export function getStages(): StageData[] {
  return [...stages];
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
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