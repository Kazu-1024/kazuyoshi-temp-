import React from 'react'

const ShortQuestion = ({ displayText, choices }) => {
  return (
    <>
        <div className="absolute w-11/12 h-[70%] top-8 left-1/2 transform -translate-x-1/2 border-2 border-black bg-white z-30 ">
            <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-centerr">
                <div className="h-[75%] pt-10 px-3 text-[17px] overflow-scroll">
                    {displayText}
                </div>

                <div className="relative w-full">
                    <div className="absolute inset-x-4 border-t border-gray-300"/>
                </div>

                <div className="h-[25%] w-full flex items-center justify-center my-1">
                    <div className="h-5/6 w-full grid grid-cols-2 gap-0 items-center text-[15px] font-inter font-bold">
                        {choices.map((choice, index) => (
                        <div key={index} className="text-center break-words whitespace-normal min-w-0">
                            {index + 1 + " "}. {choice}
                        </div>
                        ))}
                    </div>
                </div>   
            </div>
        </div>
    </>
  )
}

export default ShortQuestion