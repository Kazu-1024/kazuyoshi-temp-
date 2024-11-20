import React from 'react'
import { useNavigate } from 'react-router-dom';
import createQ from '../../assets/images/createQ.png'
import crown from '../../assets/images/crown.png'
import study from '../../assets/images/study.png'
import Home from '../../assets/images/Home.png'
import Users from '../../assets/images/Users.png'


const Footer = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
      navigate('/');
    }
  return (
    <>
      <button className="" onClick={handleGoHome}><img src={Home} /></button>
      <button className="pt-1" onClick={() => navigate('/CreateQuestions')}><img src={createQ} /></button>
      <button className="" onClick={() => navigate('/QuizReview')}><img src={study} /></button>
      <button className="" onClick={() => navigate('/Rankings')}><img src={crown} /></button>
      <button className="" onClick={() => navigate('/UserDetails')}><img src={Users} /></button>
    </>
  )
}

export default Footer