type BaseShape = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotate: number;
  fill: string;
  stroke: string;
};

export type ShapeData =
  | (BaseShape & { type: 'rect'; })
  | (BaseShape & { type: 'tri'; })
  | (BaseShape & { type: 'oval'; radiusX: number; radiusY: number; })
  | (BaseShape & { type: 'text'; text: string; fontSize: number; background: string; })
  | (BaseShape & { type: 'image'; src: string; });