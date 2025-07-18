import { Image } from "canvas";

type BaseShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWeight: number;
};

export type ShapeData =
  | (BaseShape & { type: 'rect'; })
  | (BaseShape & { type: 'tri'; })
  | (BaseShape & { type: 'oval'; radiusX: number; radiusY: number; })
  | (BaseShape & { type: 'text'; text: string; fontSize: number; background: string; })
  | (BaseShape & { type: 'image'; image: HTMLImageElement; });