// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

"use client";

import { useRef, useState } from 'react';
import { getPageElements, getPageElementsInfo, getStages } from '@/lib/stageStore';
import { jsPDF } from "jspdf";
import { registerAllFont } from '@/util/jsDocFonts';
import { useTranslation } from 'react-i18next';
import { fontsUsage } from '@/lib/fontData';

type ExportPageProps = {
  onClose: () => void;
  exportFileName: string;
};

const ExportPage: React.FC<ExportPageProps> = ({ onClose, exportFileName }) => {
  const { t } = useTranslation();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const wholeLoadingBarDiv = useRef<HTMLDivElement>(null);
  const [progressBarProgress, setProgressBarProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");

  const [fileName, setFileName] = useState<string>(exportFileName);

  const [compressionValue, setCompressionValue] = useState<string>("high");
  const compressionMap: Record<string, string> = {
    high: "SLOW",
    medium: "MEDIUM",
    low: "FAST",
    none: "NONE",
  };
  type ImageCompression = 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW';

  const pxTommScaler = 25.4/300;

  async function exportToPDF() {
    setProgressText(t("export-page.creating-document"));
    const stages = getStages();
    const totalPageCount = stages.length;

    const compressionSpeed = compressionMap[compressionValue] as ImageCompression;

    const firstPageWidth = stages[0].width * pxTommScaler;
    const firstPageHeight = stages[0].height * pxTommScaler;
    const doc = new jsPDF({
        unit: 'mm',
        format: [firstPageWidth, firstPageHeight],
        compress: compressionSpeed === "NONE" ? false : true,
    });

    setProgressText(t("export-page.loading-all-fonts"));
    console.log(fontsUsage);
    await registerAllFont(doc);

    const pageElements = getPageElements();
    const pageElementsInfo = getPageElementsInfo();

    
    
    stages.forEach((stage, stageIndex) => {
      setProgressText(t("export-page.rendering-page")+" "+stageIndex+"/"+totalPageCount);
      setProgressBarProgress((stageIndex/totalPageCount)*100);
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
              doc.setFontSize(element.fontSize * ( 72 / 78 ) );
              doc.setFont(element.fontFamily, "normal");

              const wrappedLines = doc.splitTextToSize(element.text, element.width);
              const lineHeight = element.fontSize * (72 / 300);
              const maxLines = Math.floor(element.height * pxTommScaler / lineHeight);
              //const longestWidth = doc.getTextWidth(element.text);
              const visibleLines = wrappedLines.slice(0, maxLines);
              //const height = (visibleLines.length * lineHeight);

              let xPosition;
              switch (element.align) {
                case "center":
                  xPosition = groupX + (element.x + (element.width/2)) * pxTommScaler;
                  break;
                case "right":
                  xPosition = groupX + (element.x + element.width) * pxTommScaler;
                  break;
                default:
                  xPosition = groupX + (element.x) * pxTommScaler;
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
              doc.text(visibleLines, xPosition, yPosition + lineHeight, { maxWidth: setWidth, align: element.align });   
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

              doc.moveTo(groupX + firstX, groupY + firstY);

              for (let i = 0; i < element.numPoints * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = element.x * pxTommScaler + Math.cos(angle) * radius;
                const py = element.y * pxTommScaler + Math.sin(angle) * radius;
                
                doc.lineTo(groupX + px, groupY + py);
                angle += angleStep;
              }

              doc.lineTo(groupX + firstX, groupY + firstY);

              doc.setFillColor(element.fill);
              doc.setDrawColor(element.stroke);
              doc.setLineWidth(element.strokeWidth * pxTommScaler);

              doc.fillStroke();   
              break;                 
          }
        })
      });
    });
    
    // Save the resulting PDF
    if (fileName !== "") {
      doc.save(fileName+".pdf");
    } else {
      doc.save("Examiniser.pdf");
    }
    setIsExporting(false);
    setProgressBarProgress(100);
    setProgressText("");
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''));
  }

  const handleCompressionDropDownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompressionValue(e.target.value);
  }

  const exportButtonHandler = () => {
    setIsExporting(true);
    exportToPDF();
  }

  return (
      <>
      <div className="absolute flex z-10 w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0">
        <div className="flex flex-col h-3/6 bg-background border border-grey shadow space-y-5 p-2 rounded-lg">
          <div className='flex w-full items-center justify-between'>
            <h2 className=" p-2 text-xl font-nunito m-0 ">{t('export-page.export-to-file')}</h2>
            <button className='p-2 m-0 ' onClick={onClose}>
              <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
            </button>
          </div>
          <div className='flex flex-col px-10 items-center justify-center h-full'>
            <div className='flex-row items-center justify-center grid grid-cols-2 gap-y-2'>
              <p className='text-left p-2 whitespace-nowrap'>{t('start.file-name')}</p>
              <input value={fileName} onChange={handleFileNameChange} className="w-full max-w-[15rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none text-ellipsis" placeholder={t('start.math-exam')} type="text" onBlur={(e) => {e.target.setSelectionRange(0, 0);}}></input>

              <p className='text-left p-2'>{t('export-page.compression')}</p>
              <select value={compressionValue} onChange={handleCompressionDropDownChange} className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                <option value="high">{t('export-page.high')}</option>
                <option value="medium">{t('export-page.medium')}</option>
                <option value="low">{t('export-page.low')}</option>
                <option value="none">{t('export-page.none')}</option>
              </select>

              <p className='text-left p-2'>{t('export-page.file-type')}</p>
              <select className="border-2 border-primary rounded p-2 bg-background cursor-pointer transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none">
                <option value="pdf">{t('export-page.pdf')}</option>
              </select>
            </div>
          </div>
          <div className="flex w-full items-center justify-center justify-between">
              <span className='flex'></span>
              <button className="border-2 border-primary text-primary text-lg rounded-lg py-2 px-4 transition-shadow duration-300 hover:shadow-[0_0_0_0.4rem_theme('colors.accent')] hover:outline-none" onClick={exportButtonHandler}>Export</button>
          </div>
        </div>
        <div className='absolute bottom-0 items-center justify-center max-h-[18%] z-10000'>
        </div>
      </div>
      {isExporting && (
      <div className='absolute z-20 w-full h-full flex flex-col left-0 top-0 right-0 bottom-0 backdrop-blur-sm items-center justify-center'>
        <h1 className='text-center text-6xl font-nunito'>{t("export-page.exporting")}</h1>
          <div className='relative m-16 items-center justify-center'>
              <div className="upload-loader">
                  <div className="upload-box upload-box-1">
                      <div className="upload-side-left"></div>
                      <div className="upload-side-right"></div>
                      <div className="upload-side-top"></div>
                  </div>
                  <div className="upload-box upload-box-2">
                      <div className="upload-side-left"></div>
                      <div className="upload-side-right"></div>
                      <div className="upload-side-top"></div>
                  </div>
                  <div className="upload-box upload-box-3">
                      <div className="upload-side-left"></div>
                      <div className="upload-side-right"></div>
                      <div className="upload-side-top"></div>
                  </div>
                  <div className="upload-box upload-box-4">
                      <div className="upload-side-left"></div>
                      <div className="upload-side-right"></div>
                      <div className="upload-side-top"></div>
                  </div>
              </div>
          </div>
          <p className='italic'></p>
          <div ref={wholeLoadingBarDiv} className='flex relative w-[90vw] sm:w-[80vw] md:w-[75vw] lg:w-[70vw] h-8 rounded-full border-2 border-primary'>
              <div style={{width: progressBarProgress+'%'}} className='absolute top-0 left-0 bottom-0 bg-contrast rounded-full' />
              <p className='absolute flex top-0 bottom-0 left-0 right-0 text-center items-center justify-center'>{progressText}</p>
          </div>
      </div>
      )}
      </>
  );
}

export default ExportPage;