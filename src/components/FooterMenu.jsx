import React from 'react'
import { useNavigate } from 'react-router-dom';

const FooterMenu = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
      navigate('/');
    }
  return (
    <>
      <button className="border-4" onClick={() => navigate('/CreateQuestions')}>作問</button>
      <button className="border-4" onClick={() => navigate('/QuizReview')}>復習</button>
      <button className="border-4" onClick={handleGoHome}>ホーム</button>
      <button className="border-4" onClick={() => navigate('/Rankings')}>ランキング</button>
      <button className="border-4" onClick={() => navigate('/UserDetails')}>ユーザー</button>
    </>
  )
}

export default FooterMenu