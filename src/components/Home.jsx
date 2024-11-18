import React from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <button className="border-4" onClick={() => navigate('/login')}>ログイン</button>
      <button type="" onClick={() => navigate('/Matching')}>マッチング開始</button>
    </>
  )
}

export default Home