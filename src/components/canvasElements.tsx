'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Rect, Ellipse, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
//import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';


interface Props {
  shape: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeData) => void;
  setDraggable: boolean;
  stageScale: number;
}

export default function CanvasElements({ shape, isSelected, onSelect, onChange, setDraggable, stageScale }: Props) {
  const rectRef = useRef<Konva.Rect | null>(null);
  const ovalRef = useRef<Konva.Ellipse | null>(null);
  const triangleRef = useRef<Konva.Line | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const trRef = useRef<Konva.Transformer>(null);
  //const [image] = useImage((shape.type === 'image' && shape.src) || '');

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
    } else if (shape.type == 'text'){
      if (isSelected && trRef.current && textRef.current) {
        trRef.current.nodes([textRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
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
          onDragEnd={ (e) => {
            onChange({ ...shape, x: e.target.x(), y: e.target.y() });
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
          onDragEnd={ (e) => {
            onChange({ ...shape, x: e.target.x(), y: e.target.y() });
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'tri':
      const trianglePoints = [
        0, Number(shape.height), 
        Number(shape.width)/2 , 0,
        Number(shape.width), Number(shape.height)
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
          onDragEnd={ (e) => {
            onChange({ ...shape, x: e.target.x(), y: e.target.y() });
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    case 'text':
      const handleDoubleClick = () => {
        const textNode = textRef.current;
        if (!textNode) return;

        const stage = textNode.getStage();
        if (!stage) return;
        const stageBox = stage.container().getBoundingClientRect();

        const textPosition = textNode.getAbsolutePosition();

        const areaPosition = {
          x: stageBox.left + textPosition.x,
          y: stageBox.top + textPosition.y,
        };

        // Create textarea and style it
        const input = document.createElement('textarea');
        input.value = shape.text || '';
        document.body.appendChild(input);

        input.style.transform = `scale(${stageScale})`;
        input.style.transformOrigin = 'top left';
        input.style.position = 'absolute';
        input.style.top = `${areaPosition.y+1}px`;
        input.style.left = `${areaPosition.x+1}px`;
        input.style.width = `${shape.width}px`;
        input.style.height = `${shape.height}px`;
        input.style.fontSize = `${shape.fontSize}px`;
        input.style.fontFamily = textNode.fontFamily();
        input.style.border = '1px solid #ccc';
        input.style.padding = '0px';
        input.style.margin = '0';
        input.style.zIndex = '1000';

        input.style.whiteSpace = 'pre-wrap';
        input.style.wordBreak = 'break-word';
        input.style.overflowWrap = 'break-word';
        input.style.overflow = 'hidden';
        input.style.resize = 'none';
        input.style.textAlign = 'left';
        input.style.lineHeight = '1';
        input.style.background = 'white';
        input.style.boxSizing = 'border-box';
        input.style.outline = 'none';
        input.style.color = shape.fill || 'black';
        

        input.focus();

        const removeInput = () => {
          document.body.removeChild(input);
        };

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            removeInput();
          }
        });

        input.addEventListener('blur', () => {
          onChange({
            ...shape,
            text: input.value,
          });
          removeInput();
        });
      };

      return (
        <>
          <Text {...shape} {...commonProps} ref={textRef} draggable={setDraggable} onDblClick={handleDoubleClick}
          onTransform={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scale({ x: 1, y: 1 });

            const newWidth = Math.max(5, node.width() * scaleX);
            const newHeight = Math.max(5, node.height() * scaleY);
            node.width(newWidth);
            node.height(newHeight);
          }}
          onTransformEnd={ () => {
            const node = textRef.current;
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
          onDragEnd={ (e) => {
            onChange({ ...shape, x: e.target.x(), y: e.target.y() });
          }}
          />
          {isSelected && <Transformer ref={trRef} />}
        </>
      );
    default:
      return null;
  }
}
