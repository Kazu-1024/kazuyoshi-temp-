import React from 'react'

const ShortQuestion = ({ displayText, choices }) => {
  return (
    <>
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-centerr">
            <div className="h-[75%] pt-10 px-3 text-[17px] overflow-scroll">
                {displayText}
            </div>

            <div className="relative w-full mb-4">
                <div className="absolute inset-x-4 border-t border-gray-300"/>
            </div>

            <div className="h-[25%] w-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 text-[11px] font-inter font-bold">
                    {choices.map((choice, index) => (
                        <div key={index} className="text-center break-words whitespace-normal min-w-0">
                            {index + 1}. {choice}
                        </div>
                    ))}
                </div>
            </div>   
        </div>
    </>
  )
}

export default ShortQuestion