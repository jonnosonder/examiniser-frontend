import { ShapeData } from "@/lib/shapeData";
import React, { memo, useEffect, useState } from "react";
import { Group, Layer, Rect, Stage } from "react-konva";
import DrawElement from "./drawElement";
import { getMarginValue, getViewMargin, StageData, stageGroupInfoData } from "@/lib/stageStore";


interface KonvaPreviewPageProps {
    stage: StageData;
    stageScale: number;
    manualScaler: number;
    pageIndex: number;
    pageGroups: ShapeData[][];
    pageGroupsInfo: stageGroupInfoData[];
}

const KonvaPreviewPage = ({ stage, stageScale, manualScaler, pageIndex, pageGroups, pageGroupsInfo }: KonvaPreviewPageProps) => {
    const [groupShapes, setGroupShapes] = useState<ShapeData[][]>(pageGroups);
    const [groupInfo, setGroupInfo] = useState<stageGroupInfoData[]>(pageGroupsInfo);

    const marginValue = getMarginValue();
    const viewMargin = getViewMargin();

    // Sync props -> state
    useEffect(() => {
        setGroupShapes(pageGroups);
        setGroupInfo(pageGroupsInfo);
    }, [pageGroups, pageGroupsInfo]);

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
                    draggable={false}
                    listening={false}
                    x={focusGroupInfo.x}
                    y={focusGroupInfo.y}
                    width={focusGroupInfo.widestX}
                    height={focusGroupInfo.widestY}
                    rotation={focusGroupInfo.rotation}
                    clip={{
                        x: 0,
                        y: 0,
                        width: focusGroupInfo.widestX,
                        height: focusGroupInfo.widestY,
                    }}
                    >
                    {shapes.map((shape) => (
                        <DrawElement key={shape.id} shape={shape}/>
                    ))}
                    </Group>
                );})}
            </Layer>
        </Stage>
    );
};

export default memo(KonvaPreviewPage);