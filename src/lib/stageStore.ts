
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

export function getStages(): StageData[] {
  return [...stages]; // return a copy
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
  };
}
