import React, { useState, useEffect } from 'react';

const Choices = ({ choices, onChoiceSelect, onTimeOut}) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const progressMax = 5;

    useEffect(() => {
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 0) {
              clearInterval(interval); // timeLeftが0になったら停止
              onTimeOut();
              return 0;
            }
            return prev - 1; // 1%ずつ減少
          });
        }, 1000); // 100msごとに減少unko
    
        return () => clearInterval(interval); // クリーンアップ
      }, [onTimeOut]);

      const handleChoiceClick = (choice) => {
        setTimeLeft(progressMax); // プログレスをリセット
        onChoiceSelect(choice); // 選択肢の処理
      };

      const progressPercentage = (timeLeft / progressMax) * 100;
    
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center h-11 bg-gray-200 rounded-t-3xl">
                <p className="font-iceland text-white text-2xl pl-3">Anser</p>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex ml-auto mr-4">
                    <p className="m-auto">{timeLeft}</p>
                </div>
            </div>
            <div className="w-11/12 h-5 mx-auto relative flex items-center">
                <div className="w-full h-1 bg-gray-300 rounded" />
                <div
                style={{ width: `${progressPercentage}%` }}
                className="absolute h-2 rounded bg-orange-700 transition-all duration-500"
                />
            </div>
            <div className="w-11/12 h-24 m-auto bg-white border-black shadow-xl shadow-shadowTop">
                <div className="grid grid-cols-4 gap-4 px-4 pt-4">
                    {choices.map((choice, index) => (
                        <button
                        key={index}
                        onClick={() => handleChoiceClick(choice)}
                        className="w-16 h-16 border-2 border-black rounded-lg py-2 bg-white shadow-lg hover:bg-gray-200 font-anton"
                        >
                        {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Choices;
