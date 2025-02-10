import React, {useState, useEffect} from 'react'
import HamburgerMenu from './HamburgerMenu'
import MTH from '../../assets/images/MTH.png'
import defaultIcon from '../../assets/images/defaultIcon.png'
import Notifications from './Notifications'
import { useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const pageTitles = {
      "/": "Home",
      "/quizreview": "relearn",
      "/rankings": "Ranking",
      "/createquestions": "Create",
      "/createvocabulary": "anki",
    };

    setPageTitle(pageTitles[location.pathname.toLowerCase()] || "Home");
  }, [location]);

  return (
    <>
      <h1 className='absolute inset-0 flex items-center justify-center font-jaro text-3xl'>
        {pageTitle}
      </h1>
      <div className="flex items-center">
        <HamburgerMenu />
        <Notifications />
      </div>
      <img src={defaultIcon} alt="" role="presentation" draggable="false" className="rounded-full border-2 border-black h-12 w-12 ml-auto mr-5" />
    </>
  )
}

export default Header