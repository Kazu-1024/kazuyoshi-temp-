import React from 'react'
import Tag1on1 from "../../assets/images/1on1_tag.png";
import MTH from "../../assets/images/MTH.png";
import RatingB from "../../assets/images/Frame_37.png";
import ResultText from '../../assets/images/ResultText.png'

const MatchLoading = () => {
  return (
    <>
      <div className="relative h-32 border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
        <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
        <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
        <div className="w-5/6 border-t border-2 border-gray-300" />
        <img src={Tag1on1} className="absolute top-2 left-2" />
      </div>
      <div className="mt-16 flex justify-center" aria-label="読み込み中">
        {/*自分のアイコン、ランク、レート表示 */}
        <div className="mr-20">
          <img src={MTH} alt="" className=" rounded-full h-12 w-12 ml-2 mr-4" />
          <div className="flex">
            <img src={RatingB} alt="" className=" rounded-full" />
            <p>1314</p>
          </div>
        </div>
        {/*相手ののアイコン、ランク、レート表示 */}
        <div className="ml-20">
          <img src={MTH} alt="" className=" rounded-full h-12 w-12 ml-2 mr-4" />
          <div className="flex">
            <img src={RatingB} alt="" className=" rounded-full" />
            <p>1314</p>
          </div>
        </div>

      </div>
      <div className="mt-48 flex flex-col items-center flex-grow">
        <p className='text-3xl font-bold'>対戦画面に移行します</p>
        <div className="flex items-center w-5/6">
          <div className="w-2 h-2 bg-black rounded-full" />
          <div className="flex-grow border-t border-2 border-black" />
          <div className="w-2 h-2 bg-black rounded-full" />
        </div>
        <p>しばらくお待ちください。</p>
      </div>
    </>
  )
}

export default MatchLoading