// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

type Point = [number, number];

export function CreateRoundedPolygonPath(
  points: Point[],
  cornerRadius: number
): string {
  if (points.length < 3) {
    throw new Error("At least 3 points are required to form a polygon.");
  }

  function getVector(a: Point, b: Point): { x: number; y: number } {
    return { x: b[0] - a[0], y: b[1] - a[1] };
  }

  function normalize(v: { x: number; y: number }): { x: number; y: number } {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  }

  function offsetPoint(
    p: Point,
    v: { x: number; y: number },
    d: number
  ): Point {
    return [p[0] + v.x * d, p[1] + v.y * d];
  }

  const path: string[] = [];

  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const v1 = normalize(getVector(curr, prev));
    const v2 = normalize(getVector(curr, next));

    const p1 = offsetPoint(curr, v1, cornerRadius);
    const p2 = offsetPoint(curr, v2, cornerRadius);

    if (i === 0) {
      path.push(`M ${p1[0]} ${p1[1]}`);
    } else {
      path.push(`L ${p1[0]} ${p1[1]}`);
    }

    path.push(`Q ${curr[0]} ${curr[1]} ${p2[0]} ${p2[1]}`);
  }

  path.push("Z");
  return path.join(" ");
}