'use client';

import { Rect, Ellipse, Line, Text } from 'react-konva';
//import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';
import { Image as KonvaImage } from "react-konva";


interface Props {
  shape: ShapeData;
  fontScale: number;
}

export default function DrawElement({ shape, fontScale }: Props) {
  switch (shape.type) {
    case 'rect':
      return (
        <Rect {...shape} listening={false} />
      );
    case 'oval':
      return (
        <Ellipse {...shape} listening={false} />
      );
    case 'tri':
      const trianglePoints = [
        0, Number(shape.height), 
        Number(shape.width)/2 , 0,
        Number(shape.width), Number(shape.height)
      ];
      return (
          <Line {...shape} points={trianglePoints} closed listening={false}/>
      );
    case 'text':
      return (
        <Text {...shape} fontSize={shape.fontSize / fontScale}  listening={false}/>
      );
    case 'image':
      return (
          <KonvaImage {...shape} listening={false}/>
      );
    default:
      return null;
  }
}
