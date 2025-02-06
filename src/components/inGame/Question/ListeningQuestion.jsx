import React, {useEffect, useState, useRef} from 'react'
import headPhonesImg from '../../../assets/images/headPhones.png'
import playImg from '../../../assets/images/play.png'
import pauseImg from '../../../assets/images/pause.png' 

const ListeningQuestion = ({ questionText, choices, explanation, isPaused, setIsReady, setStartTime, startTime, isTimerReady, setIsTimerReady, ws, handleAnswerGiven, handleAnswerUnlock, handleAnswerCorrect, onGameEnd }) => {
    const [situation, setSituation] = useState("");
    const [question, setQuestion] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const speechSynthesisRef = useRef(null);
    const utteranceRef = useRef(null);

    const handlePlay = () => {
        if (speechSynthesisRef.current) {
            let lang = "en-US";
            let voiceName = "";
    
            const userAgent = navigator.userAgent.toLowerCase();
    
            if (userAgent.indexOf("chrome") !== -1) {
                // Chrome 用の音声設定
                voiceName = "Google UK English Male";
            } else if (userAgent.indexOf("safari") !== -1) {
                // Safari 用の音声設定
                voiceName = "Samantha";
            } else if (userAgent.indexOf("firefox") !== -1) {
                // Firefox 用の音声設定
                voiceName = "Google US English";
            } else {
                // その他のブラウザのデフォルト設定
                voiceName = "Google US English";
            }
    
            // 音声を設定
            setVoice(lang, voiceName);
    
            // 音声再生
            speechSynthesisRef.current.speak(utteranceRef.current);
            setIsPlaying(true);
        }
    };

    const handlePause = () => {
        if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
            speechSynthesisRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleResume = () => {
        if (speechSynthesisRef.current && !speechSynthesisRef.current.speaking) {
            speechSynthesisRef.current.resume();
            setIsPlaying(true);
        }
    };

    const setVoice = (lang, voiceName) => {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.lang === lang && voice.name === voiceName);
    
        if (selectedVoice) {
            utteranceRef.current.voice = selectedVoice;
        } else {
            console.error("指定した音声が見つかりません");
        }
    };

    useEffect(() => {
        const [situation, question] = questionText.split("A:");
        setSituation(situation.replace("Q:", "").trim());
        setQuestion(question.trim());

        setTimeout(() => {
            console.log("handlePlay");
            handlePlay();
        }, 3000);

    },[questionText]);

    useEffect(() => {
        if (!explanation || isTimerReady) return;

        utteranceRef.current = new SpeechSynthesisUtterance(explanation);
        speechSynthesisRef.current = speechSynthesis;

        // 音声が終了したら
        utteranceRef.current.onend = () => {
            setIsTimerReady(true);
            console.log("isstop",isPaused);
            setIsPlaying(false);

            if(!startTime) {
                ws.send(JSON.stringify({
                    type: 'settingTimer',
                }));
            };
            setIsReady(true);
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if(data.status == "timer_start"){
                    setIsReady(true);
                    setStartTime(data.startTime);
                }else if(data.status == 'answer_given'){
                    handleAnswerGiven(data);
                }else if(data.status == 'answer_unlock'){
                    handleAnswerUnlock(data);
                }else if(data.status == 'answer_correct'){
                    setIsReady(false);
                    setStartTime(null);
                    handleAnswerCorrect(data);
                }else if(data.status == 'game_end'){
                    onGameEnd(data);
                }
                // console.log(event.data.startTime);
                };

                ws.onclose = (event) => {
                    console.log("Connection closed:", event);
                };
            
                ws.onerror = (event) => {
                    console.log("Error occurred:", event);
                };
            };

        if (isPaused) { 
            handlePause();
        } else if (!isPaused && !isPlaying) {
            handleResume();
        }

        // Cleanup on component unmount or when questionText changes
        return () => {
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel();
            }
        }; 
    }, [explanation, isPaused ]);

    return (
        <>
            <div className="absolute w-11/12 h-[90%] top-8 left-1/2 transform -translate-x-1/2 border-2 border-black bg-white z-30">
                <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-centerr">
                    <div className="h-[45%] pt-10 px-3 text-[15px] overflow-scroll">
                        Queston:  {question}
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