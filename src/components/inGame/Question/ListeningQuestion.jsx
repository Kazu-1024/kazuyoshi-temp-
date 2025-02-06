import React, {useEffect, useState, useRef} from 'react'
import headPhonesImg from '../../../assets/images/headPhones.png'
import playImg from '../../../assets/images/play.png'
import pauseImg from '../../../assets/images/pause.png' 

const ListeningQuestion = ({ questionText, choices, isPaused, ws, setIsTimerReady }) => {
    const [explanationText, setExplanationText] = useState("");
    const [readingText, setReadingText] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const speechSynthesisRef = useRef(null);
    const utteranceRef = useRef(null);

    useEffect(() => {
        const [explanation, reading] = questionText.split("A:");
        setExplanationText(explanation.replace("Q:", "").trim());
        setReadingText(reading.trim());
    },[questionText]);

    useEffect(() => {
        utteranceRef.current = new SpeechSynthesisUtterance(questionText);
        speechSynthesisRef.current = speechSynthesis;
    }, [isPaused]);

    return (
        <>
            <div className="absolute w-11/12 h-[90%] top-8 left-1/2 transform -translate-x-1/2 border-2 border-black bg-white z-30">
                <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-centerr">
                    <div className="h-[45%] pt-10 px-3 text-[15px] overflow-scroll">
                        Queston:  {explanationText}
                    </div>
                    <div className="h-1/3 w-full grid grid-cols-2 gap-0 items-center text-[11px] font-inter font-bold">
                            {choices.map((choice, index) => (
                            <div key={index} className="text-center break-words whitespace-normal min-w-0">
                                {index + 1 + " "}. {choice}
                            </div>
                            ))}
                        </div>
                    <div className="relative w-full mb-4">
                        <div className="absolute inset-x-4 border-t border-gray-300"/>
                    </div>
                    <div className="h-[55%] w-full flex flex-col items-center justify-center">
                        <p className="font-bold text-2xl">Listen it.</p>
                        <div className=""></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ListeningQuestion