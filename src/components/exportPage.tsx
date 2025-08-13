// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useState } from 'react';
import { getPageElements, getPageElementsInfo, getStages } from '@/lib/stageStore';
import { jsPDF } from "jspdf";
import Advert from './advert';

type ExportPageProps = {
  onClose: () => void;
  exportFileName: string;
};

const ExportPage: React.FC<ExportPageProps> = ({ onClose, exportFileName }) => {

  const [fileName, setFileName] = useState<string>(exportFileName);

  const [qualityValue, setQualityValue] = useState<string>("high");
  const qualityMap: Record<string, number> = {
    high: 1,
    medium: 0.5,
    low: 0.01,
  };
  const [compressionValue, setCompressionValue] = useState<string>("high");
  const compressionMap: Record<string, string> = {
    high: "SLOW",
    medium: "MEDIUM",
    low: "FAST",
    none: "NONE",
  };
  type ImageCompression = 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW';

  const pxTommScaler = 25.4/300;

  const exportToPDF = () => {
    const stages = getStages();

    const firstPageWidth = stages[0].width * pxTommScaler;
    const firstPageHeight = stages[0].height * pxTommScaler;
    const doc = new jsPDF({
        unit: 'mm',
        format: [firstPageWidth, firstPageHeight],
    });

    const quality = qualityMap[qualityValue];
    console.log(quality);

    const pageElements = getPageElements();
    const pageElementsInfo = getPageElementsInfo();

    const compressionSpeed = compressionMap[compressionValue] as ImageCompression;
    
    stages.forEach((stage, stageIndex) => {
        if (stage.stageRef && stage.stageRef.current){
            if (stageIndex !== 0) {
                doc.addPage(); 
            }
            if (stage.background !== "" && stage.background !== "white" && stage.background !== "#ffffff") {
              const width = stage.width * pxTommScaler;
              const height = stage.height * pxTommScaler;

              doc.setFillColor(stage.background);
              doc.rect(0, 0, width, height, "F");
            }

            pageElements[stageIndex].forEach((group, groupID) => {
              const groupInfo = pageElementsInfo[stageIndex][groupID]
              const groupX = groupInfo.x * pxTommScaler
              const groupY = groupInfo.y * pxTommScaler
              group.forEach((element) => {
                console.log(element.type);
                switch (element.type) {
                  case "rect":
                    doc.setFillColor(element.fill);
                    doc.setDrawColor(element.stroke);
                    doc.setLineWidth(element.strokeWidth * pxTommScaler);
                    doc.rect(groupX + element.x * pxTommScaler, groupY + element.y * pxTommScaler, element.width * pxTommScaler, element.height * pxTommScaler, "FD");
                    console.log(groupX + element.x * pxTommScaler, groupY + element.y * pxTommScaler, element.width * pxTommScaler, element.height * pxTommScaler, "FD");
                    break;
                  case "oval":
                    doc.setFillColor(element.fill);
                    doc.setDrawColor(element.stroke);
                    doc.setLineWidth(element.strokeWidth * pxTommScaler);
                    doc.ellipse(groupX + element.x * pxTommScaler, groupY + element.y * pxTommScaler, element.width * 0.5 * pxTommScaler, element.height * 0.5 * pxTommScaler, "FD");
                    break;
                  case "tri":
                    doc.setFillColor(element.fill);
                    doc.setDrawColor(element.stroke);
                    doc.setLineWidth(element.strokeWidth * pxTommScaler);
                    doc.triangle(groupX, groupY + element.height * pxTommScaler, groupX + (element.width * pxTommScaler)/2, groupY, groupX + element.width * pxTommScaler, groupY + element.height * pxTommScaler, "FD");
                    break;
                  case "rightAngleTri":
                    doc.setFillColor(element.fill);
                    doc.setDrawColor(element.stroke);
                    doc.setLineWidth(element.strokeWidth * pxTommScaler);
                    doc.triangle(groupX, groupY + element.height * pxTommScaler, groupX, groupY, groupX + element.width * pxTommScaler, groupY + element.height * pxTommScaler, "FD");
                    break;
                  case "text":
                    doc.setFontSize(element.fontSize);

                    const wrappedLines = doc.splitTextToSize(element.text, element.width);
                    const lineHeight = element.fontSize * (300/72) * pxTommScaler;
                    const maxLines = Math.floor(element.height * pxTommScaler / lineHeight);
                    const visibleLines = wrappedLines.slice(0, maxLines);
                    //const height = (visibleLines.length * lineHeight);

                    let xPosition;
                    switch (element.align) {
                      case "center":
                        xPosition = (groupX + element.x + (element.width/2)) * pxTommScaler;
                        break;
                      case "right":
                        xPosition = (groupX + element.x + element.width) * pxTommScaler;
                        break;
                      default:
                        xPosition = (groupX + element.x) * pxTommScaler;
                        break;
                    }
                     
                    const yPosition = groupY + element.y * pxTommScaler;
                    const setWidth = element.width * pxTommScaler;

                    /*
                    if (element.background !== "" || element.borderWeight !== 0) { 
                      doc.setFillColor(element.background);
                      doc.setDrawColor(element.border);
                      doc.setLineWidth(element.borderWeight);
                      doc.rect(xPosition, yPosition, setWidth, height * pxTommScaler, "FD");
                    }
                    */

                    doc.setTextColor(element.fill);
                    doc.text(visibleLines, xPosition, yPosition + lineHeight, { maxWidth: setWidth - 1, align: element.align });   
                    break;
                  case "image":
                    doc.addImage(element.image, "PNG", groupX + element.x * pxTommScaler, groupY + element.y * pxTommScaler, element.width * pxTommScaler, element.height * pxTommScaler, undefined, compressionSpeed, element.rotation);
                    break;
                  case "star":
                    const outerRadius = Math.min(element.width * pxTommScaler, element.height * pxTommScaler) / 2;
                    const innerRadius = outerRadius / 2;

                    const angleStep = Math.PI / element.numPoints;
                    let angle = -Math.PI / 2;

                    const firstX = element.x * pxTommScaler + Math.cos(angle) * outerRadius;
                    const firstY = element.y * pxTommScaler + Math.sin(angle) * outerRadius;

                    doc.moveTo(firstX, firstY);

                    for (let i = 0; i < element.numPoints * 2; i++) {
                      const radius = i % 2 === 0 ? outerRadius : innerRadius;
                      const px = element.x * pxTommScaler + Math.cos(angle) * radius;
                      const py = element.y * pxTommScaler + Math.sin(angle) * radius;
                      
                      doc.lineTo(px, py);
                      angle += angleStep;
                    }

                    doc.lineTo(firstX, firstY);

                    doc.setFillColor(element.fill);
                    doc.setDrawColor(element.stroke);
                    doc.setLineWidth(element.strokeWidth * pxTommScaler);

                    doc.fillStroke();   
                    break;                 
                }
              })
            });
        }
    });
    
    // Save the resulting PDF
    if (fileName !== "") {
      doc.save(fileName+".pdf");
    } else {
      doc.save("Examiniser.pdf");
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''));
  }

  const handleQualityDropDownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQualityValue(e.target.value);
  }

  const handleCompressionDropDownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompressionValue(e.target.value);
  }

  return (
      <div className="absolute flex z-10 w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0">
        <div className="flex flex-col h-1/2 bg-background border border-grey shadow space-y-5 p-2 rounded-lg">
          <div className='flex w-full items-center justify-between'>
            <h2 className=" p-2 text-2xl font-semibold m-0 ">Export to File</h2>
            <button className='p-2 m-0 ' onClick={onClose}>
              <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
            </button>
          </div>
          <div className='flex flex-col px-10 items-center justify-center w-full h-full'>
            <div className='flex flex-col space-y-4'>
              <div className="flex flex-row w-full items-center">
                <p className='p-2 whitespace-nowrap'>File Name: </p>
                <input value={fileName} onChange={handleFileNameChange} className="w-full max-w-[15rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder='Maths Exam' type="text"></input>
              </div>
              <div className="flex flex-row w-full items-center">
                <p className='flex text-center p-2 pr-7'>Quality: </p>
                <select value={qualityValue} onChange={handleQualityDropDownChange} className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-row w-full items-center">
                <p className='flex text-center p-2 pr-7'>Compression: </p>
                <select value={compressionValue} onChange={handleCompressionDropDownChange} className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center justify-between">
              <span className='flex'></span>
              <button className="border-2 border-primary text-primary text-lg rounded-lg py-2 px-4 transition-shadow duration-300 hover:shadow-[0_0_0_0.4rem_theme('colors.accent')] hover:outline-none" onClick={exportToPDF}>Export</button>
          </div>
        </div>
        <div className='absolute bottom-0 items-center justify-center max-h-[18%] z-10000'>
          <Advert slot="8527418128" />
        </div>
      </div>
  );
}

export default ExportPage;