import React, { useEffect, useState } from 'react';
import correct from '../../assets/images/correct.png';
import incorrect from "../../assets/images/incorrect.png";

const AnswerAnimation = ({ isCorrect }) => {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      setShowImage(true);
      const timer = setTimeout(() => {
        setShowImage(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  return (
    <>
        {showImage && (
        <div className="absolute mt-40 top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none animate-fadeInOut">
            <img
            src={isCorrect ? correct : incorrect}
            alt={isCorrect ? 'Correct' : 'Incorrect'}
            className="w-1/2 h-auto opacity-50"
            />
        </div>
        )}

        {showImage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-gray-600 bg-opacity-50  text-white flex items-center justify-center z-30">
                <span className="text-lg font-bold">
                    {isCorrect ? '正解！' : '不正解！'}
                </span>
            </div>
        )}
    </>
  );
};

export default AnswerAnimation;
