import '../../styles/create.css';

export default function CreatePage() {
   
    return (
    <div className="w-full h-full flex">
        {/* Starting question, new or continue */}
        <div className="absolute z-[100] w-full h-full flex justify-center items-center backdrop-blur">
            <div className="flex flex-col sm:flex-row w-[80%] sm:w-[65%] lg:w-[50%] h-[20%] sm:h-[30%] lg:h-[40%] m-4 gap-8">
                <button className="createNewPaperButtonWrapper relative hover:shadow-[0_0_0_1rem_theme('colors.accent')] transition-all duration-300 ease-in-out border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Create New Paper
                </button>
                <button className="uploadPaperButtonWrapper relative hover:shadow-[0_0_0_1rem_theme('colors.contrast')] transition-all duration-300 border-4 border-primary rounded-lg w-full sm:h-1/2 sm:w-1/2 sm:h-full p-4 items-center justify-center text-center text-lg sm:text-xl lg:text-2xl flex items-center justify-center">
                    Upload a Paper
                </button>
            </div>
        </div>
    </div>
);
}