import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import selectStyle from '../assets/images/style_select.png';
import startButton from '../assets/images/startButton.png';
import ratingBg from '../assets/images/ratingBg.png';
import HelpCircle from '../assets/images/HelpCircle.png'

const Home = () => {
  const navigate = useNavigate();

  const [rate, SetRate] = useState(1314);
  return (
    <>
      {/* <button className="border-4" onClick={() => navigate('/login')}>ログイン</button>
      <button type="" onClick={() => navigate('/Matching')}>マッチング開始</button> */}
      <div className="relative flex flex-col h-full w-full">
        <div className="absolute right-1 top-1">
          <img src={ratingBg} alt="Rating Background" className="block" />
          <p className="absolute inset-0 left-9 flex items-center text-brack font-jaro tracking-wider text-xl outlined-bold">
            {rate}
          </p>
        </div>
        <div className="w-full h-28 flex flex-col justify-center">
          <select size="1" className="absolute left-1/2 transform -translate-x-1/2 w-1/3 flex justify-center items-center text-center h-8">
            <option value="eiken">英検準一級</option>
            <option value="TOEIC">TOEIC</option>
          </select>
        </div>
        <div className="relative flex flex-col items-center">
          <img src={selectStyle} className="mx-auto w-11/12" alt="Style Select" />
          <button className="absolute bottom-5 w-1/2 h-16" onClick={() => navigate('/Matching')}>
            <img src={startButton} alt="Start Button" className="w-full h-full" />
          </button>
        </div>
        <div className="absolute bottom-20 left-2 mb-2">
          <buton onClick=""><img src={HelpCircle} className="w-10 h-10"/></buton>
        </div>
      </div>
    </>
  )
}

export default Home