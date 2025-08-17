// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

import { ShapeData } from "@/lib/shapeData";
import Konva from "konva";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Transformer } from "react-konva";
import DrawElement from "./drawElement";
import { addToHistoryUndo, getMarginValue, getViewMargin, historyData, pageElements, pageElementsInfo, RENDER_PREVIEW,  StageData, stageGroupInfoData } from "@/lib/stageStore";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { useSelectRef } from "./editorContextProvider";


interface KonvaPageProps {
    stage: StageData;
    stageScale: number;
    manualScaler: number;
    pageIndex: number;
    pageGroups: ShapeData[][];
    pageGroupsInfo: stageGroupInfoData[];
    editQuestionButtonHandler: (passedPage?: number, passedGroupID?: number) => void;
}

const KonvaPage = ({ stage, stageScale, manualScaler, pageIndex, pageGroups, pageGroupsInfo, editQuestionButtonHandler }: KonvaPageProps) => {
    const [groupShapes, setGroupShapes] = useState<ShapeData[][]>(pageGroups);
    const [groupInfo, setGroupInfo] = useState<stageGroupInfoData[]>(pageGroupsInfo);

    const { selectIndex, setSelectIndex } = useSelectRef();
    
    const inverseStageScale = 1 / stageScale;

    useEffect(() => {
        const handleChange = () => {
            console.log("select index update");
            const transformer = transformerRef.current;
            if (transformer && transformer.nodes().length !== 0 && selectIndex.current.pageIndex !== pageIndex) {
                transformer.nodes([]);
                transformer.getLayer()?.batchDraw();
            }
        };

        window.addEventListener('selectIndexChanged', handleChange);

        return () => {
            window.removeEventListener('selectIndexChanged', handleChange);
        };
    }, []);

    const groupRefs =  useRef<(Konva.Group | null)[]>([]);
    const transformerRef = useRef<Konva.Transformer>(null);

    const marginValue = getMarginValue();
    const viewMargin = getViewMargin();

    // Sync props -> state
    useEffect(() => {
        setGroupShapes(pageGroups);
        setGroupInfo(pageGroupsInfo);
    }, [pageGroups, pageGroupsInfo]);

    const groupOnClick = (e: KonvaEventObject<MouseEvent, Node<NodeConfig>> | KonvaEventObject<Event, Node<NodeConfig>>, groupIndex: number) => {
        const clickedNode = e.target.getParent();
        const currentTransformer = transformerRef.current;
        if (currentTransformer && clickedNode && clickedNode.getType() === "Group") {
            currentTransformer.nodes([clickedNode]);
            currentTransformer.getLayer()?.batchDraw();
            const clientRect = clickedNode.getClientRect({ skipTransform: false });
            const newShapeClientRect = {x: clientRect.x * inverseStageScale, y: clientRect.y * inverseStageScale, width: clientRect.width * inverseStageScale, height: clientRect.height * inverseStageScale};
            window.dispatchEvent(new CustomEvent('shapeClientRect', {  detail: newShapeClientRect }));
        }
        setSelectIndex({pageIndex, groupIndex});
    }

    const updateGroupShapes = useCallback((groupIndex: number, updatedShapes: ShapeData[]) => {
        setGroupShapes((prev) => {
            const updatedGroups = [...prev];
            updatedGroups[groupIndex] = updatedShapes;
            return updatedGroups; // Just update state here
        });
        pageElements[pageIndex][groupIndex] = updatedShapes;
    }, []);

    const updateGroupInfo = useCallback((groupIndex: number, updatedShapesInfo: stageGroupInfoData) => {
        setGroupInfo((prev) => {
            const updatedGroupsInfo = [...prev];
            updatedGroupsInfo[groupIndex] = updatedShapesInfo;
            return updatedGroupsInfo;  // only update state here
        });
        pageElementsInfo[pageIndex][groupIndex] = updatedShapesInfo;
    }, []);

    const onDbClickHanlder = (groupIndex: number) => {
        editQuestionButtonHandler(pageIndex, groupIndex);
    }

    //const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

    return (
        <Stage
            width={stage.width * stageScale * manualScaler}
            height={stage.height * stageScale * manualScaler}
            scaleX={stageScale * manualScaler}
            scaleY={stageScale * manualScaler}
            pixelRatio={1}
            ref={stage.stageRef}
            style={{
                transformOrigin: 'top left',
            }}
            onClick={(e) => {
                const target = e.target as Konva.Node;
                if (target.id() === "background-rect") {
                    const transformer = transformerRef.current;
                    transformer?.nodes([]);
                    transformer?.getLayer()?.batchDraw();
                    setSelectIndex({pageIndex: null, groupIndex: null});
                    return;
                }
            }}
            onTap={(e) => {
                const target = e.target as Konva.Node;
                if (target.id() === "background-rect") {
                    const transformer = transformerRef.current;
                    transformer?.nodes([]);
                    transformer?.getLayer()?.batchDraw();
                    setSelectIndex({pageIndex: null, groupIndex: null});
                    return;
                }
            }}
            >
            <Layer>
                <Rect 
                    id='background-rect'
                    x={0}
                    y={0}
                    width={stage.width}
                    height={stage.height}
                    fill={stage.background || '#ffffff'}
                />
                { viewMargin && ( 
                <Rect 
                    x={marginValue}
                    y={marginValue}
                    width={stage.width-(marginValue*2)}
                    height={stage.height-(marginValue*2)}
                    fill={"transparent"}
                    stroke={"black"}
                    strokeWidth={2}
                />
                )}
                {groupShapes.map((shapes, groupIndex) => {
                    const focusGroupInfo = groupInfo[groupIndex];
                    return (
                    <Group
                    key={`${pageIndex}-${groupIndex}`}
                    ref={(el) => {groupRefs.current[groupIndex] = el;}}
                    draggable={true}
                    listening={true}
                    x={focusGroupInfo.x}
                    y={focusGroupInfo.y}
                    width={focusGroupInfo.widestX}
                    height={focusGroupInfo.widestY}
                    rotation={focusGroupInfo.rotation}
                    onClick={(e) => groupOnClick(e, groupIndex)}
                    onTap={(e) => groupOnClick(e, groupIndex)}
                    onDblClick={() => onDbClickHanlder(groupIndex)}
                    onDblTap={() => onDbClickHanlder(groupIndex)}
                    clip={{
                        x: 0,
                        y: 0,
                        width: focusGroupInfo.widestX,
                        height: focusGroupInfo.widestY,
                    }}
                    onDragMove={(e) => {
                        const node = e.target as Konva.Group;

                        const box = node.getClientRect({ skipTransform: false });

                        
                        const box_x = box.x * inverseStageScale;
                        const box_y = box.y * inverseStageScale;
                        const box_width =  box.width * inverseStageScale;
                        const box_height = box.height * inverseStageScale;

                        const stageWidth = stage.width;
                        const stageHeight = stage.height;

                        let newX = node.x();
                        let newY = node.y();

                        if (box_x < 0) {
                            newX += -box_x;
                        }
                        if (box_y < 0) {
                            newY += -box_y;
                        }
                        if (box_x + box_width  > stageWidth) {
                            newX += stageWidth - (box_x + box_width);
                        }
                        if (box_y + box_height > stageHeight) {
                            newY += stageHeight - (box_y + box_height);
                        }
                        
                        node.position({ x: newX, y: newY });
                        window.dispatchEvent(new CustomEvent('shapeOnDrag', { detail: { x: Math.trunc(newX), y: Math.trunc(newY)} }));
                    }}
                    onTransform={(e) => {
                        const node = e.target;
                        const clientRect = node.getClientRect();
                        const newShapeClientRect = {x: clientRect.x * inverseStageScale, y: clientRect.y * inverseStageScale, width: clientRect.width, height: clientRect.height};
                        window.dispatchEvent(new CustomEvent('shapeClientRect', {  detail: newShapeClientRect }));
                    }}
                    onDragEnd={(e) => {
                        const node = e.target as Konva.Group;
                        const focusGroupInfo = groupInfo[groupIndex];
                        const newGroupInfo = {
                            ... focusGroupInfo,
                            x: Math.trunc(node.x()),
                            y: Math.trunc(node.y()),
                        } as stageGroupInfoData;
                        updateGroupInfo(groupIndex, newGroupInfo);
                        RENDER_PREVIEW();
                        addToHistoryUndo({
                            command: "info",
                            pageIndex: pageIndex,
                            groupIndex: groupIndex,
                            from: groupInfo[groupIndex],
                            to: newGroupInfo,
                        } as historyData);
                        const clientRect = node.getClientRect();
                        const newShapeClientRect = {x: clientRect.x * inverseStageScale, y: clientRect.y * inverseStageScale, width: clientRect.width * inverseStageScale, height: clientRect.height * inverseStageScale};
                        window.dispatchEvent(new CustomEvent('shapeClientRect', {  detail: newShapeClientRect }));
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target as Konva.Group;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        const updatedShapes = shapes.map((shape) => ({
                            ...shape,
                            x: Math.trunc(shape.x * scaleX),
                            y: Math.trunc(shape.y * scaleY),
                            width: Math.trunc(shape.width * scaleX),
                            height: Math.trunc(shape.height * scaleY),
                        }));
                        const focusGroupInfo = groupInfo[groupIndex];
                        const newGroupInfo = {
                            widestX: Math.trunc(focusGroupInfo.widestX * scaleX),
                            widestY: Math.trunc(focusGroupInfo.widestY * scaleY),
                            x: Math.trunc(node.x()),
                            y: Math.trunc(node.y()),
                            rotation: Math.trunc(node.rotation())
                        } as stageGroupInfoData;
                        node.scaleX(1);
                        node.scaleY(1);
                        updateGroupShapes(groupIndex, updatedShapes);
                        updateGroupInfo(groupIndex, newGroupInfo);
                        RENDER_PREVIEW();
                        addToHistoryUndo({
                            command: "info-contents",
                            pageIndex: pageIndex,
                            groupIndex: groupIndex,
                            from: groupInfo[groupIndex],
                            to: newGroupInfo,
                            contentsFrom: shapes,
                            contentsTo: updatedShapes
                        } as historyData);
                        const clientRect = node.getClientRect();
                        const newShapeClientRect = {x: clientRect.x * inverseStageScale, y: clientRect.y * inverseStageScale, width: clientRect.width * inverseStageScale, height: clientRect.height * inverseStageScale};
                        window.dispatchEvent(new CustomEvent('shapeClientRect', {  detail: newShapeClientRect }));
                    }}
                    >
                    <Rect
                        x={0}
                        y={0}
                        width={groupInfo[groupIndex].widestX}
                        height={groupInfo[groupIndex].widestY}
                        fill="rgba(0,0,0,0)" // invisible but interactive
                        listening={true}
                        draggable={false}
                    />
                    {shapes.map((shape) => (
                        <DrawElement key={shape.id} shape={shape}/>
                    ))}
                    </Group>
                );})}
                <Transformer 
                    key={"tranformer-"+pageIndex}
                    ref={transformerRef} 
                    rotationAnchorOffset={10}
                    rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                    rotationSnapTolerance={6}
                    anchorFill={"#fff"}
                    anchorStrokeWidth={1}
                    anchorSize={10}
                    anchorCornerRadius={2}
                />
            </Layer>
        </Stage>
    );
};

export default memo(KonvaPage);