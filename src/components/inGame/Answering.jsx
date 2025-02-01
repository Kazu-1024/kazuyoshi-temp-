import React from 'react'

const Answering = ({ showChoices, isAnswering }) => {
  return (
    <>
    {(showChoices || isAnswering) && (
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-20" />
    )}

    {isAnswering && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-gray-600 bg-opacity-50  text-white flex items-center justify-center z-30">
          <span className="text-lg font-bold">
            対戦相手が解答中...
          </span>
        </div>
    )}
    </>
  )
}

export default Answering