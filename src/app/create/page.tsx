export default function CreatePage() {
  return (
    <div className="w-full h-full flex">
        {/* Starting question, new or continue */}
        <div className="absolute w-full h-full flex justify-center items-center backdrop-blur">
            <div className="flex border border-primary rounded-lg p-4">
                <div className="flex w-1/2 h-full">
                    <h2>Create New Paper</h2>
                </div>
                <div className="flex w-1/2 h-full">
                    <h2>Upload a Paper</h2>
                </div>
            </div>
        </div>
    </div>
);
}