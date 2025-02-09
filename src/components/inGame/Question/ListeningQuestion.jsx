import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';

const ListeningQuestion = forwardRef(({ questionText, choices, explanation,onEnd }, ref) => {
    const [situation, setSituation] = useState("");
    const [question, setQuestion] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const speechSynthesisRef = useRef(null);
    const utteranceRef = useRef(null);

    // 音声再生処理
    const handlePlay = () => {
        if (speechSynthesisRef.current) {
            let lang = "en-US";
            let voiceName = "Google US English"; 

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
        if (speechSynthesisRef.current && speechSynthesisRef.current.speaking) {
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
            // サポートされていない場合はデフォルト音声を使用
            const fallbackVoice = voices.find(voice => voice.lang === lang); 
            if (fallbackVoice) {
                utteranceRef.current.voice = fallbackVoice;
            } else {
                utteranceRef.current.voice = voices[0];
            }
        }
    };

    // 受け取った問題文と選択肢を設定
    useEffect(() => {
        const [situation, question] = questionText.split("A:");
        setSituation(situation.replace("Q:", "").trim());
        setQuestion(question.trim());

        // 初期設定: 音声再生を開始
        // setTimeout(() => {
        //     handlePlay();
        // }, 1000);
    }, [questionText]);

    // 説明文がある場合の音声再生
    useEffect(() => {
        if (!explanation ) return;

        utteranceRef.current = new SpeechSynthesisUtterance(explanation);
        speechSynthesisRef.current = speechSynthesis;

         // 音声が終了したらタイマーを設定
        utteranceRef.current.onend = () => {
            setIsPlaying(false);
            // 親に onend を通知
            if (onEnd) {
                onEnd("end");
            }
        };
        return () => {
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel();
            }
        };
    }, [explanation]);

    // 外部から関数を呼び出せるようにする
    useImperativeHandle(ref, () => ({
        play: handlePlay,
        pause: handlePause,
        resume: handleResume
    }));

    return (
        <div className="absolute w-11/12 h-[90%] top-8 left-1/2 transform -translate-x-1/2 border-2 border-black bg-white z-30">
            <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                <div className="h-[45%] pt-10 px-3 text-[15px] overflow-scroll">
                    <p>Question: {question}</p>
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
                </div>
            </div>
        </div>
    );
});

export default ListeningQuestion;
