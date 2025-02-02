import React, {useState} from 'react'
import HamburgerMenu from './HamburgerMenu'
import MTH from '../../assets/images/MTH.png'
import defaultIcon from '../../assets/images/defaultIcon.png'
import Notifications from './Notifications'

const Header = () => {
  const [rate, setRate] = useState(1500)
  return (
    <>
      <div className='absolute inset-0 flex items-center justify-center font-jaro text-3xl'>HOME</div>
      <div className="flex items-center">
        <HamburgerMenu />
        <Notifications />
      </div>
      <img src={defaultIcon} alt="" className="rounded-full border-2 border-black h-12 w-12 ml-auto mr-5" />
    </>
  )
}

export default Header