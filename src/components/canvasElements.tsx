'use client';

import React, { useEffect, useRef } from 'react';
import { Rect, Ellipse, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
//import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';
import { KonvaEventObject } from 'konva/lib/Node';


interface Props {
  shape: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeData) => void;
  setDraggable: boolean;
  stageScale: number;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  stageWidth?: number,
  stageHeight?: number,
  listening: boolean,
  onDragMove?: (e: KonvaEventObject<MouseEvent>) => void;
}

export default function CanvasElements({ shape, isSelected, onSelect, onChange, setDraggable, stageScale, dragBoundFunc, stageWidth, stageHeight, listening, onDragMove }: Props) {
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
    dragBoundFunc: dragBoundFunc,
  };

  const anchorDragBoundFunc = (oldPos: { x: number; y: number }, newPos: { x: number; y: number }) => {
    if (!stageWidth || !stageHeight || !stageScale) {
      return { x: oldPos.x, y: oldPos.y };
    }

    // Convert newPos to logical (unscaled) coords
    let x = newPos.x / stageScale;
    let y = newPos.y / stageScale;

    // Clamp inside stage bounds (logical coords)
    x = Math.min(Math.max(x, 0), stageWidth);
    y = Math.min(Math.max(y, 0), stageHeight);

    // Convert back to scaled coords
    return { x: x * stageScale, y: y * stageScale };
  };

  const handleTransformEnd = () => {
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
      width: Math.round((Math.max(5, node.width() * scaleX) + Number.EPSILON) * 100000) / 100000,
      height: Math.round((Math.max(5, node.height() * scaleY) + Number.EPSILON) * 100000) / 100000,
    });
  };

  switch (shape.type) {
    case 'rect':
      return (
        <>
          <Rect {...shape} {...commonProps} ref={rectRef} draggable={setDraggable} onDragMove={(e) => onDragMove?.(e)} listening={listening}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round((e.target.x() + Number.EPSILON) * 100000) / 100000, y: Math.round((e.target.y() + Number.EPSILON) * 100000) / 100000 });
          }}
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
                width: Math.round((Math.max(5, node.width() * scaleX) + Number.EPSILON) * 100000) / 100000,
                height: Math.round((Math.max(5, node.height() * scaleY) + Number.EPSILON) * 100000) / 100000,
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          />}
        </>
      );
    case 'oval':
      return (
        <>
          <Ellipse {...shape} {...commonProps} ref={ovalRef} draggable={setDraggable} onDragMove={(e) => onDragMove?.(e)} listening={listening}
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
                width: Math.round((Math.max(5, node.width() * scaleX) + Number.EPSILON) * 100000) / 100000,
                height: Math.round((Math.max(5, node.height() * scaleY) + Number.EPSILON) * 100000) / 100000,
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round((e.target.x() + Number.EPSILON) * 100000) / 100000, y: Math.round((e.target.y() + Number.EPSILON) * 100000) / 100000 });
          }}
          />
          {isSelected && <Transformer ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          />}
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
          <Line {...shape} {...commonProps} points={trianglePoints} closed ref={triangleRef} draggable={setDraggable} onDragMove={(e) => onDragMove?.(e)} listening={listening}
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
                width: Math.round((Math.max(5, node.width() * scaleX) + Number.EPSILON) * 100000) / 100000,
                height: Math.round((Math.max(5, node.height() * scaleY) + Number.EPSILON) * 100000) / 100000,
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round((e.target.x() + Number.EPSILON) * 100000) / 100000, y: Math.round((e.target.y() + Number.EPSILON) * 100000) / 100000 });
          }}
          />
          {isSelected && <Transformer ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          />}
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
        input.style.fontSize = `${shape.fontSize / stageScale}px`;
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
          <Text {...shape} fontSize={shape.fontSize/stageScale} {...commonProps} ref={textRef} draggable={setDraggable} onDragMove={(e) => onDragMove?.(e)} onDblClick={handleDoubleClick} listening={listening}
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
                width: Math.round((Math.max(5, node.width() * scaleX) + Number.EPSILON) * 100000) / 100000,
                height: Math.round((Math.max(5, node.height() * scaleY) + Number.EPSILON) * 100000) / 100000,
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round((e.target.x() + Number.EPSILON) * 100000) / 100000, y: Math.round((e.target.y() + Number.EPSILON) * 100000) / 100000 });
          }}
          />
          {isSelected && <Transformer ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          />}
        </>
      );
    default:
      return null;
  }
}
