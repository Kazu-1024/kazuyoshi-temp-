import React from 'react'
import Tag1on1 from "../../assets/images/1on1_tag.png";

const MatchLoading = () => {
  return (
    <>
        <div className="relative h-32 border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
            <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
            <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
            <div className="w-5/6 border-t border-2 border-gray-300" />
            <img src={Tag1on1} className="absolute top-2 left-2" />
        </div>
    </>
  )
}

export default MatchLoading