// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

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
};

type Basics = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

type alginType = "left" | "center" | "right" | "justify";

export type ShapeData =
  | (BaseShape & { type: 'rect'; cornerRadius: number; })
  | (BaseShape & { type: 'tri'; cornerRadius: number; })
  | (BaseShape & { type: 'rightAngleTri'; cornerRadius: number; })
  | (BaseShape & { type: 'oval'; })
  | (BaseShape & { type: 'text'; text: string; fontSize: number; background: string; align: alginType; border: string; borderWeight: number; })
  | (BaseShape & { type: 'image'; image: HTMLImageElement; cornerRadius: number; })
  | (Basics & { type: 'star'; numPoints: number; width: number; height: number; })
  | (BaseShape & { type: 'path'; data: string; });