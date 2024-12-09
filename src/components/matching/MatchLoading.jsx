import React, { useState, useEffect } from 'react'
import Tag1on1 from "../../assets/images/1on1_tag.png";
import MTH from "../../assets/images/MTH.png";
import RatingB from "../../assets/images/Frame_37.png";
import ResultText from '../../assets/images/ResultText.png'
import { useLocation, useNavigate } from 'react-router-dom';

const MatchLoading = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;
  const [userRate, setUserRate] = useState(1500);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setError('Room IDが見つかりません');
      return;
    }

    // レート取得
    const fetchUserRate = async () => {
      try {
        const response = await fetch('http://localhost:8080/rate/user', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserRate(data.rating);
        }
      } catch (error) {
        console.error('レート取得エラー:', error);
      }
    };

    fetchUserRate();

    // 2秒後にInGame画面に遷移
    const timer = setTimeout(() => {
      navigate('/ingame', { 
        state: { 
          roomId: roomId,
          opponentRate: userRate // 仮の対戦相手のレート（後で実際の値に置き換え）
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [roomId, navigate, userRate]);

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="relative h-32 border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
        <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
        <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
        <div className="w-5/6 border-t border-2 border-gray-300" />
        <img src={Tag1on1} className="absolute top-2 left-2" />
      </div>
      <div className="mt-16 flex justify-center" aria-label="読み込み中">
        <div className="mr-20">
          <img src={MTH} alt="" className=" rounded-full h-12 w-12 ml-2 mr-4" />
          <div className="flex">
            <img src={RatingB} alt="" className=" rounded-full" />
            <p>{userRate}</p>
          </div>
        </div>
        <div className="ml-20">
          <img src={MTH} alt="" className=" rounded-full h-12 w-12 ml-2 mr-4" />
          <div className="flex">
            <img src={RatingB} alt="" className=" rounded-full" />
            <p>{userRate}</p>
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