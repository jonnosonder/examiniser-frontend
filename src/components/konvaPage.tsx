import { ShapeData } from "@/lib/shapeData";
import Konva from "konva";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Transformer } from "react-konva";
import DrawElement from "./drawElement";
import { getMarginValue, getViewMargin, RENDER_PREVIEW, StageData, stageGroupInfoData } from "@/lib/stageStore";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";


interface KonvaPageProps {
    stage: StageData;
    stageScale: number;
    manualScaler: number;
    pageIndex: number;
    pageGroups: ShapeData[][];
    pageGroupsInfo: stageGroupInfoData[];
    onGroupChange: (groupIndex: number, updatedShapes: ShapeData[]) => void;
    onGroupInfoChange: (groupIndex: number, updatedShapes: stageGroupInfoData) => void;
    editQuestionButtonHandler: (passedPage?: number, passedGroupID?: number) => void;
}

export default function KonvaPage({ stage, stageScale, manualScaler, pageIndex, pageGroups, pageGroupsInfo, onGroupChange, onGroupInfoChange, editQuestionButtonHandler }: KonvaPageProps) {
    const [groupShapes, setGroupShapes] = useState<ShapeData[][]>(pageGroups);
    const [groupInfo, setGroupInfo] = useState<stageGroupInfoData[]>(pageGroupsInfo);
    //const [selectedId, setSelectedId] = useState<number | null>(null);

    // Refs for each group
    const groupRefs =  useRef<(Konva.Group | null)[]>([]);
    const transformerRef = useRef<Konva.Transformer>(null);

    const marginValue = getMarginValue();
    const viewMargin = getViewMargin();

    // Sync props -> state
    useEffect(() => {
        setGroupShapes(pageGroups);
        setGroupInfo(pageGroupsInfo);
        console.log("Syncing");
        console.log(pageGroupsInfo);
    }, [pageGroups, pageGroupsInfo]);

    const groupOnClick = (e: KonvaEventObject<MouseEvent, Node<NodeConfig>> | KonvaEventObject<Event, Node<NodeConfig>>) => {
        const clickedNode = e.target.getParent();
        const currentTransformer = transformerRef.current;
        if (currentTransformer && clickedNode && clickedNode.getType() === "Group") {
            currentTransformer.nodes([clickedNode]);
            currentTransformer.getLayer()?.batchDraw();
        }
    }

    const updateGroupShapes = useCallback((groupIndex: number, updatedShapes: ShapeData[]) => {
        setGroupShapes((prev) => {
            const updatedGroups = [...prev];
            updatedGroups[groupIndex] = updatedShapes;
            return updatedGroups; // Just update state here
        });
        onGroupChange(groupIndex, updatedShapes); // Call side effect AFTER state update
    }, [onGroupChange]);

    const updateGroupInfo = useCallback((groupIndex: number, updatedShapesInfo: stageGroupInfoData) => {
        setGroupInfo((prev) => {
            const updatedGroupsInfo = [...prev];
            updatedGroupsInfo[groupIndex] = updatedShapesInfo;
            return updatedGroupsInfo;  // only update state here
        });
        onGroupInfoChange(groupIndex, updatedShapesInfo); // side effect outside setState updater
        RENDER_PREVIEW();
    }, [onGroupInfoChange]);

    const onDbClickHanlder = (groupIndex: number) => {
        editQuestionButtonHandler(pageIndex, groupIndex);
    }

    const round4 = (num: number) => Math.round((num + Number.EPSILON) * 10000) / 10000;

    return (
        <Stage
            width={stage.width * stageScale * manualScaler}
            height={stage.height * stageScale * manualScaler}
            scaleX={stageScale * manualScaler}
            scaleY={stageScale * manualScaler}
            pixelRatio={1}
            style={{
                transformOrigin: 'top left',
            }}
            ref={stage.stageRef}
            onMouseDown={(e) => {
                const target = e.target as Konva.Node;
                if (target.id() === "background-rect") {
                    const transformer = transformerRef.current;
                    transformer?.nodes([]);
                    transformer?.getLayer()?.batchDraw();
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
                    //console.log("to draw");
                    //console.log(focusGroupInfo);
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
                    onClick={(e) => groupOnClick(e)}
                    onTap={(e) => groupOnClick(e)}
                    onDblClick={() => onDbClickHanlder(groupIndex)}
                    onDblTap={() => onDbClickHanlder(groupIndex)}
                    onDragMove={(e) => {
                        const node = e.target;

                        const box = node.getClientRect({ skipTransform: false });

                        const inverseStageScale = 1 / stageScale;
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
                    }}
                    onDragEnd={(e) => {
                        console.log("drag end");
                        console.log(groupInfo);
                        const node = e.target;
                        const focusGroupInfo = groupInfo[groupIndex];
                        const newGroupInfo = {
                            ... focusGroupInfo,
                            x: round4(node.x()),
                            y: round4(node.y()),
                        } as stageGroupInfoData;
                        updateGroupInfo(groupIndex, newGroupInfo);
                    }}
                    onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        const updatedShapes = shapes.map((shape) => ({
                            ...shape,
                            x: round4(shape.x * scaleX),
                            y: round4(shape.y * scaleY),
                            width: round4(shape.width * scaleX),
                            height: round4(shape.height * scaleY),
                        }));
                        const focusGroupInfo = groupInfo[groupIndex];
                        const newGroupInfo = {
                            widestX: round4(focusGroupInfo.widestX * scaleX),
                            widestY: round4(focusGroupInfo.widestY * scaleY),
                            x: round4(node.x()),
                            y: round4(node.y()),
                            rotation: round4(node.rotation())
                        } as stageGroupInfoData;
                        node.scaleX(1);
                        node.scaleY(1);
                        updateGroupShapes(groupIndex, updatedShapes);
                        updateGroupInfo(groupIndex, newGroupInfo);
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
}