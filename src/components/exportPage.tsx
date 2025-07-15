"use client";

import { useState } from 'react';
import { getStages } from '@/lib/stageStore';
import { jsPDF } from "jspdf";

type ExportPageProps = {
  onClose: () => void;
  exportFileName: string;
};

const ExportPage: React.FC<ExportPageProps> = ({ onClose, exportFileName }) => {

  const [fileName, setFileName] = useState<string>(exportFileName);

  const [qualityValue, setQualityValue] = useState<number>(100);
  const qualitySteps = [1, 10, 25, 50, 75, 100];

  const pxTommScaler = 25.4/300;

  const exportToPDF = () => {
    const stages = getStages();

    const firstPageWidth = stages[0].width * pxTommScaler;
    const firstPageHeight = stages[0].height * pxTommScaler;
    const doc = new jsPDF({
        unit: 'mm',
        format: [firstPageWidth, firstPageHeight],
    });
    console.log(firstPageWidth);
    console.log(firstPageHeight);
    
    stages.forEach((stage, stageIndex) => {
        console.log(stage.stageRef);
        if (stage.stageRef && stage.stageRef.current){
            console.log("adding");
            const width = stage.stageRef.current.width() * pxTommScaler;
            const height = stage.stageRef.current.height() * pxTommScaler;

            // Get the layer (first layer in this case)
            const layer = stage.stageRef.current.getChildren()[0];

            // Ensure the layer is fully rendered
            layer.batchDraw();

            const stageScale = stage.stageRef.current.scale();

            // Convert the layer to a high-res data URL at 300 DPI
            const dataUrl = layer.toDataURL({
                mimeType: "image/jpeg",
                quality: qualityValue/100,
                pixelRatio: 300/72,
            });

            if (stageIndex !== 0) {
                doc.addPage(); 
            }
            
            doc.addImage(dataUrl, "JPEG", 0, 0, width / stageScale.x, height / stageScale.y);
            console.log(width / stageScale.x,);
            console.log(height / stageScale.y);
        }
    });
    
    // Save the resulting PDF
    doc.save(fileName+".pdf");
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
  }

  const handleQualitySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    setQualityValue(qualitySteps[index]);
  };

  return (
      <div className="absolute flex z-10 w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0">
        <div className="flex flex-col w-1/2 h-1/2 bg-background border-2 border-primary space-y-5 p-2 rounded-lg">
          <div className='flex w-full items-center justify-between'>
            <h2 className=" p-2 text-xl font-semibold m-0 ">Export to File</h2>
            <button className='p-2 m-0 ' onClick={onClose}>
              <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
            </button>
          </div>
          <div className='flex flex-col items-center justify-center w-full h-full'>
            <div className="flex flex-row w-full items-center justify-center p-4">
              <p className='p-2'>File Name: </p>
              <input value={fileName} onChange={handleFileNameChange} className="w-full max-w-[15rem] border-2 border-primary rounded px-2 py-1 transition-shadow duration-300 focus:shadow-[0_0_0_0.4rem_theme('colors.accent')] focus:outline-none" placeholder='Maths Exam' type="text"></input>
            </div>
            <div className="flex flex-col w-full items-center justify-center">
              <p className='flex text-center'>Export Quality</p>
              <p className='flex text-center'>{qualityValue}%</p>
              <input
                type="range"
                min={0}
                max={qualitySteps.length - 1}
                step={1}
                value={qualitySteps.indexOf(qualityValue)}
                onChange={handleQualitySliderChange}
                className="flex w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex w-full justify-between text-sm text-gray-500 mt-2 px-2">
                {qualitySteps.map((step) => (
                  <span key={step}>{step}%</span>
                ))}
              </div>
            </div>
           
          </div>
          <div className="flex w-full items-center justify-center justify-between">
              <span className='flex'></span>
              <button className='border border-primary rounded-lg py-1 px-2' onClick={exportToPDF}>Export</button>
          </div>
        </div>
      </div>
  );
}

export default ExportPage;