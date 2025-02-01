import React from 'react'
import heart from '../../assets/images/heart.png';

const GameStatus = ({ iconSrc, hp, score, isPlayerB}) => {
  const renderDots = (max, type, isPlayerB) => {
    const dotArray = Array.from({ length : 5 });

    return dotArray.map((_, index) => {
      const displayOrder = isPlayerB ? dotArray.length - 1 - index : index;
      const isFilled = displayOrder < max;
      
      return (
        <span key={index} className="relative w-3 h-3">
          {type === "heart" ? (
            isFilled ? (
              <img src={heart} alt="heart" className="w-full h-full" />
            ) : (
              <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-black" />
            )
          ) : type === "score" ? (
            <div className={`absolute inset-0 m-auto w-2 h-2 rounded-full ${isFilled ? "bg-black" : "bg-gray-300"}`} />
          ): null}
        </span>
      );
    })
  }

  return (
    <>
      <div className={`w-full flex items-center mt-5 ${isPlayerB ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-center w-5/6 h-2/3 ${isPlayerB ? 'pr-2 mr-2' : 'pl-2 ml-2'}`}>
              {!isPlayerB && ( <img src={iconSrc} alt="player Icon" className="w-12 h-12 rounded-full mr-2 border-2 border-black" /> )}
              <div className={`flex flex-col ${isPlayerB ? 'items-end ml-auto' : ''}`}>
                  <div className="flex border-2 rounded-3xl border-black px-2 py-1">{renderDots(hp, "heart", isPlayerB)}</div>
                  <div className="flex border-2 rounded-3xl border-black px-2 py-1 mt-2">{renderDots(score, "score", isPlayerB)}</div>
              </div>
              {isPlayerB && ( <img src={iconSrc} alt="player Icon" className="w-12 h-12 rounded-full ml-2 border-2 border-black" /> )}
          </div>
      </div>
    </>
  )
}

export default GameStatus