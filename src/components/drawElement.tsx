// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { Rect, Ellipse, Path, Text, Star } from 'react-konva';
//import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';
import { Image as KonvaImage } from "react-konva";
import { CreateRoundedPolygonPath } from '@/calculation/createRoundedPolygonPath';


interface Props {
  shape: ShapeData;
}

export default function DrawElement({ shape }: Props) {
  switch (shape.type) {
    case 'rect':
      return (
        <Rect {...shape} cornerRadius={shape.cornerRadius/100 * Math.min(shape.width * 0.5, shape.height * 0.5)} listening={false} />
      );
    case 'oval':
      return (
        <Ellipse {...shape} listening={false} />
      );
    case 'tri':
      const trianglePoints: [number, number][] = [
        [0, Number(shape.height)], 
        [Number(shape.width)/2 , 0],
        [Number(shape.width), Number(shape.height)]
      ];
      const pathData_trianglePoints = CreateRoundedPolygonPath(trianglePoints, shape.cornerRadius/100 * Math.min(shape.width * 0.5, Math.sqrt(Math.pow(shape.height, 2) + Math.pow(shape.width * 0.5, 2))));
      return (
          <Path {...shape} data={pathData_trianglePoints} closed listening={false}/>
      );
    case 'rightAngleTri':
      const rightAngleTrianglePoints: [number, number][] = [
        [0, Number(shape.height)], 
        [0 , 0],
        [Number(shape.width), Number(shape.height)]
      ];
      const pathData_rightAngleTrianglePoints = CreateRoundedPolygonPath(rightAngleTrianglePoints, shape.cornerRadius/100 * Math.min(shape.width * 0.5, shape.height * 0.5));
      return (
          <Path {...shape} data={pathData_rightAngleTrianglePoints} closed listening={false}/>
      );
    case 'text':
      return (
        <Text {...shape} fontSize={shape.fontSize * (300/72)} listening={false}/>
      );
    case 'image':
      return (
          <KonvaImage {...shape} listening={false}/>
      );
    case 'star':
      const desiredWidth = shape.width;
      const desiredHeight = shape.height;
      const outerRadius = Math.min(desiredWidth, desiredHeight) / 2;
      const innerRadius = outerRadius / 2;
      return (
          <Star {...shape} innerRadius={innerRadius} outerRadius={outerRadius} listening={false}/>
      );
    case 'path':
      return (
        <Path {...shape} listening={false}/>
      );
      break;
    default:
      return null;
  }
}
