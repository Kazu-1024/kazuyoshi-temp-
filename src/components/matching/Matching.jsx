import React from 'react'
import { useNavigate } from "react-router-dom";

const Matching = () => {
  const navigate = useNavigate();

  const backHomepage = () => {
    navigate(-1)
  }
  return (
    <>
      <div className="flex justify-center" aria-label="読み込み中">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>        
      <div className='flex justify-center mt-96'>

        <h1 className='mx-auto'>マッチング待機中・・・</h1>
      </div>
      <div className='flex justify-center '>

        <button onClick={backHomepage} className="mx-auto size-96 text-white border-4 rounded-3xl border-cyan-300 bg-black ">キャンセル</button>
      </div>
    </>
  )
}

export default Matching