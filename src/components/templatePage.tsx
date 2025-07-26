import Advert from "./advert";

type TemplatePageProps = {
  onClose: () => void;
};

const TemplatePage: React.FC<TemplatePageProps> = ({ onClose }) => {

    return(
        <div className="absolute flex w-screen h-screen bg-opacity-50 backdrop-blur-sm items-center justify-center left-0 top-0">
            <div className="flex flex-col h-3/4 w-3/4 bg-background border-2 border-primary space-y-5 p-2 rounded-lg">
                <div className='flex w-full items-center justify-between'>
                    <h2 className="p-2 text-2xl font-semibold m-0 ">Premade Assets</h2>
                    <button className='p-2 m-0 ' onClick={onClose}>
                        <svg className='w-6 h-6' clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>
                    </button>
                </div>
                <div className="flex w-full h-full">
                    <p>Will be able to add pre-made layouts and generate basic maths questions (In Development)</p>
                </div>
            </div>
            <div className='absolute bottom-2 w-full max-h-[10%] z-10000'>
                <Advert slot="1234567890" />
            </div>
        </div>
    );
}

export default TemplatePage;