import React from 'react'
import { useNavigate } from 'react-router-dom';
import createQ from '../../assets/images/createQ.png'
import anki from '../../assets/images/anki.png'
import study from '../../assets/images/study.png'
import Home from '../../assets/images/Home.png'
import Users from '../../assets/images/Users.png'


const Footer = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
      navigate('/');
    }

    const buttonClass = "flex items-center justify-center w-[20%] h-full"
    const imgClass = "max-h-[80%] w-auto object-contain"
  return (
    <>
      <button className={buttonClass} onClick={handleGoHome}><img src={Home} className={`${imgClass} p-2`}/></button>
      <button className={buttonClass} onClick={() => navigate('/CreateQuestions')}><img src={createQ} className={`${imgClass} pt-1`} /></button>
      <button className={buttonClass} onClick={() => navigate('/QuizReview')}><img src={study} className={`${imgClass} p-1`} /></button>
      <button className={buttonClass} onClick={() => navigate('/CreateVocabulary')}><img src={anki} className={`${imgClass} pt-1 px-2`} /></button>
      <button className={buttonClass} onClick={() => navigate('/UserDetails')}><img src={Users} className={`${imgClass} p-1`} /></button>
    </>
  )
}

export default Footer