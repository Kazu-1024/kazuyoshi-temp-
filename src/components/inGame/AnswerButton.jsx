import React from 'react'
import Button from '../../assets/images/Button.png'

const AnswerButton = ({ isLocked, onClick }) => {
  return (
    <>
        <button type="button" className="h-[60%] aspect-square z-10"
            onClick={() => {
                if (!isLocked) {
                  onClick();
                }
              }}
              disabled={isLocked}
            >
            <img src={Button} alt="button" draggable="false" className="w-full h-full object-contain" />
        </button>
    </>
  )
}

export default AnswerButton