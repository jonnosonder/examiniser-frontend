
type BaseShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
};

export type ShapeData =
  | (BaseShape & { type: 'rect'; cornerRadius: number;})
  | (BaseShape & { type: 'tri'; })
  | ({ id: string; type: 'oval'; x: number; y: number; radiusX: number; radiusY: number; rotation: number; fill: string; stroke: string; strokeWidth: number; shadowColor: string; shadowBlur: number; })
  | (BaseShape & { type: 'text'; text: string; fontSize: number; background: string; align: string; })
  | (BaseShape & { type: 'image'; image: HTMLImageElement; cornerRadius: number;});