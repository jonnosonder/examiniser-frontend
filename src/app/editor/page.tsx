"use client";

import useBeforeUnload from '@/components/useBeforeUnload';
import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Decimal from 'decimal.js';
import { useData } from "@/context/dataContext";
import AllStages from '@/components/allStages';

import { addStage } from '@/lib/stageStore';


export default function EditorPage() {
    useBeforeUnload(true);

    const stageContainerRef = useRef<HTMLDivElement>(null);
    const [scalePage, setScalePage] = useState(1);

    const [pageSizes, setPageSizes] = useState<Array<{ width: number; height: number }>>([]);

    const { pageFormatData } = useData();

    const [actionWindow, setActionWindow] = useState(false);

    useEffect(() => {
        const width = pageFormatData?.width != null
            ? Number(pageFormatData.width)
            : Number(new Decimal(297).times(300).div(25.4));

        const height = pageFormatData?.height != null
            ? Number(pageFormatData.height)
            : Number(new Decimal(420).times(300).div(25.4));

        addStage({
            id: `stage-${Date.now()}`,
            width: width,
            height: height,
        });
    }, [pageFormatData]);

    
    useEffect(() => {
        function handleResize() {
            const container = stageContainerRef.current;
            if (!container || pageSizes.length === 0) return;

            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const { width, height } = pageSizes[0]; // Use the first page's size

            const scaleX = containerWidth / width;
            const scaleY = containerHeight / height;

            setScalePage(Math.min(scaleX, scaleY));
        }

        handleResize(); // Initial resize on mount and when pageSizes changes
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [pageSizes]);


    const buttons = [
        { icon: 
            <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m21 3.998c0-.478-.379-1-1-1h-16c-.62 0-1 .519-1 1v16c0 .621.52 1 1 1h16c.478 0 1-.379 1-1zm-16.5.5h15v15h-15zm6.75 6.752h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z" fillRule="nonzero"/></svg>
            , label: 'Add Question' },
        { icon: 
            <svg className='w-full h-full' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.749c0-.414.336-.75.75-.75s.75.336.75.75v9.249c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm1.521 9.689 9.012-9.012c.133-.133.217-.329.217-.532 0-.179-.065-.363-.218-.515l-2.423-2.415c-.143-.143-.333-.215-.522-.215s-.378.072-.523.215l-9.027 8.996c-.442 1.371-1.158 3.586-1.264 3.952-.126.433.198.834.572.834.41 0 .696-.099 4.176-1.308zm-2.258-2.392 1.17 1.171c-.704.232-1.274.418-1.729.566zm.968-1.154 7.356-7.331 1.347 1.342-7.346 7.347z" fillRule="nonzero"/></svg>
            , label: 'Edit Question' },
        { icon: <p></p>, label: '' },
    ];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex h-10 border-b-1 border-primary"></div>
            <div className="flex-1 flex-row w-full flex">
                <div ref={stageContainerRef} className="flex-1 h-full bg-grey items-center justify-center flex">
                    <AllStages />
                </div>
                <div className="h-full">
                    <div
                        className={`flex flex-col text-primary transition-width duration-300 ease-in-out h-full
                            ${actionWindow ? 'w-16' : 'w-48'}`}
                        >
                        <button
                            onClick={() => setActionWindow(!actionWindow)}
                            className="p-4 focus:outline-none"
                        >
                            {actionWindow ? 
                            (<svg className='w-8 h-8' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fillRule="nonzero"/></svg>) 
                            : 
                            (<div className='w-full'>
                                <svg className='w-8 h-8' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fillRule="nonzero"/></svg>
                            </div>)}
                        </button>

                        <nav className="flex-1 mt-4">
                            {buttons.map(({ icon, label }) => (
                            <button
                                key={label}
                                className="flex text-center items-center justify-center w-full p-3 focus:outline-none"
                            >
                                <span className="w-8 h-8 text-lg items-center justify-center">{icon}</span>
                                {!actionWindow && <span className="ml-3">{label}</span>}
                            </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}