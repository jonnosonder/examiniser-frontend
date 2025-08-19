// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import React, { useEffect, useRef } from 'react';
import { Rect, Ellipse, Path, Text, Transformer, Star } from 'react-konva';
import Konva from 'konva';
//import useImage from 'use-image';
import { ShapeData } from '@/lib/shapeData';
import { KonvaEventObject } from 'konva/lib/Node';
import { Image as KonvaImage } from "react-konva";
import { CreateRoundedPolygonPath } from '@/calculation/createRoundedPolygonPath';


interface Props {
  shape: ShapeData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: ShapeData) => void;
  stageScale: number;
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number };
  stageWidth?: number,
  stageHeight?: number,
  onDragMoveUpdates?: (e: KonvaEventObject<MouseEvent>) => void;
  onTransformUpdates?: (e: KonvaEventObject<Event>) => void;
}

export default function CanvasElements({ shape, isSelected, onSelect, onChange, stageScale, dragBoundFunc, stageWidth, stageHeight, onDragMoveUpdates, onTransformUpdates }: Props) {
  const rectRef = useRef<Konva.Rect | null>(null);
  const ovalRef = useRef<Konva.Ellipse | null>(null);
  const triangleRef = useRef<Konva.Path | null>(null);
  const rightAngleTriangleRef = useRef<Konva.Path | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const starRef = useRef<Konva.Star | null>(null);
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
    } else if (shape.type == 'rightAngleTri'){
      if (isSelected && trRef.current && rightAngleTriangleRef.current) {
        trRef.current.nodes([rightAngleTriangleRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else if (shape.type == 'text'){
      if (isSelected && trRef.current && textRef.current) {
        trRef.current.nodes([textRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else if (shape.type == 'image'){
      if (isSelected && trRef.current && imageRef.current) {
        trRef.current.nodes([imageRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else if (shape.type == 'star'){
      if (isSelected && trRef.current && starRef.current) {
        trRef.current.nodes([starRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [isSelected, shape.type]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    dragBoundFunc: dragBoundFunc,
  };

  const transformerCommonProps = {
    rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
    rotationSnapTolerance: 6,
    anchorFill: "#fff",
    anchorStrokeWidth: 1,
    anchorSize: 12,
    anchorCornerRadius: 2,
  }

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

  const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;
  const round4WithMax = (num: number) => Math.round((Math.max(5, num) + Number.EPSILON) * 10000) / 10000;

  switch (shape.type) {
    case 'rect':
      return (
        <>
          <Rect {...shape} {...commonProps} cornerRadius={shape.cornerRadius/100 * Math.min(shape.width * 0.5, shape.height * 0.5)} ref={rectRef} onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
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
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    case 'oval':
      return (
        <>
          <Ellipse {...shape} radiusX={shape.width/2} radiusY={shape.height/2} {...commonProps} ref={ovalRef}  onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onTransformEnd={ () => {
            const node = ovalRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    case 'tri':
      const trianglePoints: [number, number][] = [
        [0, Number(shape.height)], 
        [Number(shape.width)/2 , 0],
        [Number(shape.width), Number(shape.height)]
      ];
      const pathData_trianglePoints = CreateRoundedPolygonPath(trianglePoints, shape.cornerRadius/100 * Math.min(shape.width * 0.5, Math.sqrt(Math.pow(shape.height, 2) + Math.pow(shape.width * 0.5, 2))));
      return (
        <>
          <Path {...shape} {...commonProps} data={pathData_trianglePoints} closed ref={triangleRef}  onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onTransformEnd={ () => {
            const node = triangleRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    case 'rightAngleTri':
      const rightAngleTrianglePoints: [number, number][] = [
        [0, Number(shape.height)], 
        [0 , 0],
        [Number(shape.width), Number(shape.height)]
      ];
      const pathData_rightAngleTrianglePoints = CreateRoundedPolygonPath(rightAngleTrianglePoints, shape.cornerRadius/100 * Math.min(shape.width * 0.5, shape.height * 0.5));
      return (
        <>
          <Path {...shape} {...commonProps} data={pathData_rightAngleTrianglePoints} closed ref={rightAngleTriangleRef}  onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onTransformEnd={ () => {
            const node = rightAngleTriangleRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
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
        input.style.fontSize = `${shape.fontSize * (300/72)}px`;
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
          <Text {...shape} fontSize={shape.fontSize * (300/72)} {...commonProps} ref={textRef} draggable={true} onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} onDblClick={handleDoubleClick} onDblTap={handleDoubleClick} 
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
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    case 'image':
      return (
        <>
          <KonvaImage {...shape} {...commonProps} ref={imageRef} onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          onTransformEnd={ () => {
            const node = imageRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    case 'star':
      const desiredWidth = shape.width;
      const desiredHeight = shape.height;
      const outerRadius = Math.min(desiredWidth, desiredHeight) / 2;
      const innerRadius = outerRadius / 2;
      return (
        <>
          <Star {...shape} innerRadius={innerRadius} outerRadius={outerRadius} {...commonProps} ref={starRef} onDragMove={(e) => {onDragMoveUpdates?.(e); onSelect()}} draggable={true}
          onDragEnd={ (e) => {
            onChange({ ...shape, x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
          }}
          onTransformEnd={ () => {
            const node = starRef.current;
            if (!node) return;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);

              onChange({
                ...shape,
                width: round4WithMax(node.width() * scaleX),
                height: round4WithMax(node.height() * scaleY),
                rotation: Math.round(node.rotation()),
              } as ShapeData);
            
          }}
          />
          {isSelected && <Transformer {...transformerCommonProps} ref={trRef} 
          anchorDragBoundFunc={anchorDragBoundFunc}
          onTransform={(e) => onTransformUpdates?.(e)}
          />}
        </>
      );
    default:
      return null;
  }
}
