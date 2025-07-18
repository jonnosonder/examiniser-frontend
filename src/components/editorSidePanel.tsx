import { useEffect, useState } from 'react';
import { getMarginValue, getViewMargin, setMarginValue, setViewMargin, getStagesBackground, setAllStagesBackground, getQuestionLayout } from '@/lib/stageStore';
import ColorSelectorSection from '@/components/colorSelectorSection';

export default function EditorSidePanel() {
    const [displayColorSelector, setDisplayColorSelector] = useState<boolean>(false);
    const toggleDisplayColorSelector = () => {setDisplayColorSelector(!displayColorSelector)}
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>(getStagesBackground());

    const [viewMarginEditor, setViewMarginEditor] = useState(getViewMargin());
    const toggleViewMargin = () => {setViewMarginEditor(!viewMarginEditor); setViewMargin(!viewMarginEditor);};
    const [marginEditorVisual, setMarginEditorVisual] = useState<string>(String(getMarginValue()));

    const [questionLayoutEditor, setQuestionLayoutEditor] = useState(getQuestionLayout());
    const toggleQuestionLayoutEditor = () => {setQuestionLayoutEditor(!questionLayoutEditor); setQuestionLayoutEditor(!questionLayoutEditor)};

    const [editPanelIndex, setEditPanelIndex] = useState<number | null>(-1);
    
    const toggleEditPanelSection = (index:number) => {
        setEditPanelIndex(editPanelIndex === index ? null : index);
    };

    const marginValueInputHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');

        setMarginEditorVisual(value);
        setMarginValue(Number(value.replace(/[^0-9]/g, '')));
    }

    useEffect(() => {
        setAllStagesBackground(selectedBackgroundColor);
    }, [selectedBackgroundColor])

    return (
        <div className='w-full h-full'>
            <div className="w-full">
                <button
                    className="w-full flex justify-between items-center px-4 py-1 bg-transparent text-primary border border-button-border text-base transition cursor-pointer"
                    onClick={() => toggleEditPanelSection(1)}
                >
                    Background
                    {editPanelIndex === 1 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    )}
                </button>

                <div
                    className={`flex flex-col overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                    editPanelIndex === 1 ? 'm-2' : 'max-h-0 p-0 border-0'
                    }`}
                >
                    <p className="text-sm">Background Colour</p>
                    <button style={{background: selectedBackgroundColor}} className='w-full h-5 border border-primary rounded-lg' onClick={toggleDisplayColorSelector}></button>
                    {displayColorSelector && (
                        <div className='absolute flex items-center justify-center left-[25vw]'>
                            <ColorSelectorSection onClose={() => setDisplayColorSelector(false)} passColorValue={setSelectedBackgroundColor} startingColor={selectedBackgroundColor} />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full">
                <button
                    className="w-full flex justify-between items-center px-4 py-1 bg-transparent text-primary border border-button-border text-base transition cursor-pointer"
                    onClick={() => toggleEditPanelSection(2)}
                >
                    Margin
                    {editPanelIndex === 2 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    )}
                </button>

                <div
                    className={`flex flex-col overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                    editPanelIndex === 2 ? 'm-2' : 'max-h-0 p-0 border-0'
                    }`}
                >   
                    <p className="text-sm">View Margin</p>
                    <button onClick={toggleViewMargin}>
                         {viewMarginEditor ? 'Showing' : 'Hiding'}
                    </button>
                    <p className="text-sm">Margin Size</p>
                    <input value={marginEditorVisual} onChange={marginValueInputHandler} placeholder='300px'></input>
                </div>
            </div>

            <div className="w-full">
                <button
                    className="w-full flex justify-between items-center px-4 py-1 bg-transparent text-primary border border-button-border text-base transition cursor-pointer"
                    onClick={() => toggleEditPanelSection(3)}
                >
                    Layout
                    {editPanelIndex === 3 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    )}
                </button>

                <div
                    className={`flex flex-col overflow-hidden transition-all duration-400 ease-linear space-y-2 ${
                    editPanelIndex === 3 ? 'm-2' : 'max-h-0 p-0 border-0'
                    }`}
                >   
                    <p className="text-sm">Question Layout</p>
                    <button onClick={toggleQuestionLayoutEditor}>
                         {questionLayoutEditor ? 'Free' : 'Rows only'}
                    </button>
                </div>
            </div>
        </div>
    );
}