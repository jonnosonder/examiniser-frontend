'use client';

import React, { useEffect, useRef } from 'react';
import { Rect, Circle, Text, Image, Transformer, Line } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';


interface Props {
  shape: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeData) => void;
}

export default function CanvasElements({ shape, isSelected, onSelect, onChange }: Props) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image] = useImage((shape.type === 'image' && shape.src) || '');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    ref: shapeRef,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) => {
      onChange({ ...shape, x: e.target.x(), y: e.target.y() });
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      if (shape.type === 'rect' || shape.type === 'image') {
        onChange({
          ...shape,
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        } as ShapeData);
      }
    },
  };

  switch (shape.type) {
    case 'rect':
      return (
        <>
          <Rect {...shape} {...commonProps} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'tri':
      return (
        <>
          <Triangle {...shape} {...commonProps} />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'circle':
      return (
        <>
            <Circle
                {...shape}
                ref={shapeRef}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={(e) => {
                onChange({
                    ...shape,
                    x: e.target.x(),
                    y: e.target.y(),
                });
                }}
                onTransformEnd={() => {
                const node = shapeRef.current;
                const scaleX = node.scaleX();

                // reset scale to avoid compounding
                node.scaleX(1);
                node.scaleY(1);

                onChange({
                    ...shape,
                    x: node.x(),
                    y: node.y(),
                    radius: Math.max(5, shape.radius * scaleX),
                });
                }}
            />
            {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
        </>
      );
    case 'text':
        return (
          <>
            <Text
              {...shape}
              {...commonProps}
              ref={shapeRef}
              draggable
              onTransform={() => {
                const node = shapeRef.current;
                if (!node) return;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // Update width/height live during transform
                const newWidth = node.width() * scaleX;
                const newHeight = node.height() * scaleY;

                // Reset scale so it doesn't visually distort
                node.scaleX(1);
                node.scaleY(1);

                // Update shape state live
                onChange({
                  ...shape,
                  x: node.x(),
                  y: node.y(),
                  width: newWidth,
                  height: newHeight,
                });
              }}
              onTransformEnd={() => {
                // Already handled live in `onTransform`, but still a good safety
                const node = shapeRef.current;
                if (!node) return;

                node.scaleX(1);
                node.scaleY(1);
              }}
            />
            {isSelected && <Transformer ref={trRef} />}
          </>
        );
    case 'image':
      return (
        <>
          <Image image={image} {...shape} {...commonProps} />
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