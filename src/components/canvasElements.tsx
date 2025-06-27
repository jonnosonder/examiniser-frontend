'use client';

import React, { useEffect, useRef } from 'react';
import { Rect, Ellipse, Text, Image, Transformer, Line } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';


interface Props {
  shape: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeData) => void;
  setDraggable: boolean;
}

export default function CanvasElements({ shape, isSelected, onSelect, onChange, setDraggable }: Props) {
  const rectRef = useRef<Konva.Rect | null>(null);
  const ovalRef = useRef<Konva.Ellipse | null>(null);
  const triangleRef = useRef<Konva.Line | null>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image] = useImage((shape.type === 'image' && shape.src) || '');

  useEffect(() => {
    if (shape.type == 'rect'){
      if (isSelected && trRef.current && rectRef.current) {
        trRef.current.nodes([rectRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else if (shape.type == 'oval'){
      if (isSelected && trRef.current && ovalRef.current) {
        trRef.current.nodes([ovalRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else if (shape.type == 'tri'){
      if (isSelected && trRef.current && triangleRef.current) {
        trRef.current.nodes([triangleRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) => {
      onChange({ ...shape, x: e.target.x(), y: e.target.y() });
    },
  };

  switch (shape.type) {
    case 'rect':
      return (
        <>
          <Rect {...shape} {...commonProps} ref={rectRef} draggable={setDraggable}
          onTransformEnd={ () => {
            const node = rectRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'oval':
      return (
        <>
          <Ellipse {...shape} {...commonProps} ref={ovalRef} draggable={setDraggable}
          onTransformEnd={ () => {
            const node = ovalRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                x: node.x(),
                y: node.y(),
                radiusX: Math.max(5, node.width() * scaleX /2),
                radiusY: Math.max(5, node.height() * scaleY /2),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'tri':
      const trianglePoints = [
        0, Number(shape.height),      // bottom-left
        Number(shape.width)/2 , 0,   // top-center
        Number(shape.width), Number(shape.height)   // bottom-right
      ];
      return (
        <>
          <Line {...shape} {...commonProps} points={trianglePoints} closed ref={triangleRef} draggable={setDraggable}
          onTransformEnd={ () => {
            const node = triangleRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    default:
      return null;
  }
}

type TriangleProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  [key: string]: any; // allow other Konva props like `draggable`
};

export function Triangle({
  x,
  y,
  width,
  height,
  fill = 'red',
  stroke = 'black',
  strokeWidth = 2,
  ...props
}: TriangleProps) {
  const points = [
    0, height,      // bottom-left
    width / 2, 0,   // top-center
    width, height   // bottom-right
  ];

  return (
    <Line
      x={x}
      y={y}
      points={points}
      closed
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}