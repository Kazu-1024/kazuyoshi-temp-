import React, { useState, useEffect} from 'react'

const Choices = ({ onAnswerTimeOut, onSelectChoice }) => {
const [timeLeft, setTimeLeft] = useState(5);
const progressMax = 5

const choices = ['1', '2', '3', '4'];

const buttonClasses = "w-16 h-16 border-2 border-black rounded-lg py-2 bg-white shadow-lg hover:bg-gray-200 font-anton";

useEffect(() => {
  if (timeLeft <= 0) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        onAnswerTimeOut();
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft]);

const ChoiceButton = ({ choice, onClick, index }) => {
  return (
    <button onClick={() => onSelectChoice(choice)} className={buttonClasses}>
      {index + 1}
    </button>
);


}

return (
  <>
    <div className="absolute max-h-56 w-full h-full flex justify-center z-30">
      <div className="absolute flex top-1/2 transform translate-y-[-50%] items-center justify-center bg-[rgba(243,244,246,0.9)] rounded-3xl shadow-lg w-10/12 h-[98%] mx-auto z-20 ">
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center h-[20%] bg-gray-200 rounded-t-3xl">
            <p className="font-iceland text-white text-2xl pl-3">Anser</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex ml-auto mr-4">
              <p className="m-auto">{timeLeft}</p>
            </div>
          </div>
          <div className="w-11/12 h-5 top-3 mx-auto relative flex items-center">
            <div className="w-full h-1 bg-gray-300 rounded">
              <div style={{ width: `${(timeLeft / progressMax) * 100}%` }} className="absolute h-2 rounded bg-orange-700 transition-all duration-500"/>
            </div>
          </div>
          <div className="w-11/12 h-24 m-auto bg-[rgba(255,255,255,0.8)] border-black shadow-xl shadow-shadowTop">
            <div className="grid grid-cols-4 gap-x-8 px-4 pt-4 items-center justify-items-center">
              {choices.map((choice, index) => (
                <ChoiceButton
                  key={index}
                  choice={choice}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
)
}

export default Choices