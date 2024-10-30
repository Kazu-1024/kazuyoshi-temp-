import React from 'react'
import { useNavigate } from 'react-router-dom';

const FooterMenu = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
      navigate('/');
    }
  return (
      <footer className="bg-cyan-400 absolute bottom-0 flex justify-around w-full py-5">
        <button className="border-4" onClick={() => navigate('/CreateQuestions')}>createQ</button>
        <button className="border-4" onClick={() => navigate('/Rankings')}>Ranking</button>
        <button className="border-4" onClick={handleGoHome}>Home</button>
        <button className="border-4" onClick={() => navigate('/Rankings')}>Ranking</button>
        <button className="border-4" onClick={() => navigate('/UserDetails')}>User</button>
      </footer>
  )
}

export default FooterMenu