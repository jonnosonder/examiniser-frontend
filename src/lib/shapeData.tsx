type BaseShape = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  fill?: string;
};

export type ShapeData =
  | (BaseShape & { type: 'rect'; width: number; height: number; fill: string })
  | (BaseShape & { type: 'tri'; width: number; height: number; fill: string })
  | (BaseShape & { type: 'circle'; radius: number; fill: string })
  | (BaseShape & { type: 'text'; text: string; width: number; height: number; fontSize: number; frontColor: string; backColor: string })
  | (BaseShape & { type: 'image'; width: number; height: number; src: string;});