import { ShapeData } from "@/lib/shapeData";
import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Layer, Rect, Stage, Transformer } from "react-konva";
import DrawElement from "./drawElement";
import { StageData, stageGroupInfoData } from "@/lib/stageStore";


interface KonvaStageProps {
    stage: StageData;
    stageScale: number;
    manualScaler: number;
    pageNumber: number;
    viewMargin: boolean;
    shapesInit: ShapeData[][];
    shapesInfoInit: stageGroupInfoData[];
    onShapesChange: (updatedShapes: ShapeData[]) => void;
}

export default function KonvaPage({ stage, stageScale, manualScaler, pageNumber, viewMargin, shapesInit, shapesInfoInit, onShapesChange }: KonvaStageProps) {
    const [shapes, setShapes] = useState<ShapeData[][]>(shapesInit);
    const [shapesInfo, setShapesInfo] = useState<stageGroupInfoData[]>(shapesInfoInit);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        setShapes(shapesInit);
    }, [shapesInit]);

    useEffect(() => {
        const layer = stage.stageRef?.current;
        const transformer = stage.transformerRef?.current;
        if (selectedId && layer && transformer) {
        const selectedNode = layer.findOne(`#${selectedId}`);
        if (selectedNode) {
            transformer.nodes([selectedNode]);
            transformer.getLayer()?.batchDraw();
        } else {
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
        }
        } else {
        transformer?.nodes([]);
        transformer?.getLayer()?.batchDraw();
        }
    }, [selectedId]);

    const updateShape = useCallback(
        (id: string, newAttrs: Partial<ShapeData>) => {
            setShapes((prevShapes) => {
                const updated = prevShapes.map((shape) => (shape.id === id ? { ...shape, ...newAttrs } : shape));
                // Notify parent
                onShapesChange(updated);
                return updated;
            });
            stage.stageRef?.current?.batchDraw();
        },
        [onShapesChange]
    );

    const handleDragEnd = (e: any, id: string) => {
        updateShape(id, {
        x: e.target.x(),
        y: e.target.y(),
        });
    };

    const handleTransformEnd = (e: any, id: string) => {
        const node = e.target;
        updateShape(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
        });
        node.scaleX(1);
        node.scaleY(1);
    };

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
                    selectedId.current.transformerRef?.current?.nodes([]);
                    selectedId.current.transformerRef?.current?.getLayer()?.batchDraw();
                    selectedId.current = {groupID: null, page: null, transformerRef: nullTransformerRef};
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
                { shapes.map((group, groupdIndex) => {
                const focusGroup = shapesInfo[groupdIndex];
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                    const scaled = stageScale * manualScaler;
                    const inverseScale = 1 / scaled;

                    let x = pos.x * inverseScale;
                    let y = pos.y * inverseScale;

                    const { width: stageWidth, height: stageHeight } = stage;
                    const elementInfo = focusGroup;

                    const maxX = stageWidth - elementInfo.widestX;
                    const maxY = stageHeight - elementInfo.widestY;

                    x = Math.max(0, Math.min(x, maxX));
                    y = Math.max(0, Math.min(y, maxY));

                    // Return in scaled space
                    return {
                        x: x * scaled,
                        y: y * scaled,
                    };
                }


                const onClickHandler = (e: Konva.KonvaEventObject<MouseEvent | Event>) => {
                    selectedId.current = {groupID: groupdIndex, page: pageNumber, transformerRef: stage.transformerRef?.current ? stage.transformerRef : nullTransformerRef};
                    const clickedNode = e.target.getParent();
                    if (clickedNode && clickedNode.getType() === "Group" && stage.transformerRef?.current) {
                    stage.transformerRef.current.nodes([clickedNode]);
                    stage.transformerRef.current.getLayer()?.batchDraw();
                    }
                } 

                const onDbClickHandler = () => {
                    editQuestionButtonHandler?.(pageNumber, groupdIndex)
                } 

                return (
                    <Group
                    key={groupdIndex + (groupdIndex * pageNumber+1)}
                    x={focusGroup.x}
                    y={focusGroup.y}
                    width={focusGroup.widestX}
                    height={focusGroup.widestY}
                    draggable={true}
                    dragBoundFunc={dragBoundFunc}
                    listening={true}
                    onClick={(e) => {onClickHandler(e)}}
                    onTap={(e) => {onClickHandler(e)}}
                    onDblClick={onDbClickHandler}
                    onDblTap={onDbClickHandler}
                    onDragEnd={ (e) => {
                        const newX = round4(e.target.x());
                        const newY = round4(e.target.y());
                        setPageElementsInfo({ ...focusGroup, x: newX, y: newY }, pageNumber, groupdIndex);
                        setSelectButtonPosition({
                        x: newX * stageScale,
                        y: newY * stageScale,
                        widestX: focusGroup.widestX * stageScale,
                        widestY: focusGroup.widestY * stageScale,
                        });
                        RENDER_PREVIEW();
                    }}
                    > 
                    <Rect
                        x={0}
                        y={0}
                        width={focusGroup.widestX}
                        height={focusGroup.widestY}
                        fill="rgba(0,0,0,0)" // invisible but interactive
                        listening={true}
                    />
                    {group.map((shape) => {
                        return(
                        <DrawElement
                        key={shape.id}
                        shape={shape}
                        />
                        );
                    })}
                    </Group>
                );
                })}
                <Transformer 
                    key={"tranformer-"+pageNumber}
                    ref={stage.transformerRef} 
                    onTransformEnd={ () => {
                    
                    const transformer = stage.transformerRef?.current;
                    if (!transformer) return;
                    const attachedNodes = transformer.nodes();
                    const liveGroup = attachedNodes[0] as Konva.Group;
                    if (!liveGroup) return;
                    const liveGroupChildren = liveGroup.getChildren();
                    
                    if (selectedId.current.groupID === null) {return;}
                    const liveGroupScaleX = liveGroup.scaleX();
                    const liveGroupScaleY = liveGroup.scaleY();
                    liveGroupChildren.forEach((child, elementID) => {
                        const newWidth = child.width() * liveGroupScaleX;
                        const newHeight = child.height() * liveGroupScaleY;
                        
                        if (elementID !== 0) {
                        if (selectedId.current.groupID === null) {return;}
                        setPageElementWidth(newWidth, pageNumber, selectedId.current.groupID, elementID-1);
                        setPageElementHeight(newHeight, pageNumber, selectedId.current.groupID, elementID-1);
                        }

                        child.width(newWidth);
                        child.height(newHeight);
                        child.scaleX(1);
                        child.scaleY(1);

                        console.log(`Child ${child.id} updated:`, {
                        width: newWidth,
                        height: newHeight,
                        scaleX: liveGroupScaleX,
                        scaleY: liveGroupScaleY,
                        });

                        // Store or send updated sizes somewhere
                    });

                    const newGroupWidth = liveGroup.width() * liveGroupScaleX;
                    const newGroupHeight = liveGroup.height() * liveGroupScaleY;
                    
                    liveGroup.scaleX(1);
                    liveGroup.scaleY(1);

                    setPageElementsInfoWidth(newGroupWidth, pageNumber, selectedId.current.groupID);
                    setPageElementsInfoHeight(newGroupHeight, pageNumber, selectedId.current.groupID);

                    // You can also store group dimensions if needed
                    console.log("Group size after transform:", {
                        width: newGroupWidth,
                        height: newGroupHeight,
                    });
                    }}
                />
            </Layer>
        </Stage>
    );
}