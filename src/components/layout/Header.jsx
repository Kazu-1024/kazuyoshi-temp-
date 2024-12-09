import React, {useState} from 'react'
import HamburgerMenu from './HamburgerMenu'
import MTH from '../../assets/images/MTH.png'
import Notifications from './Notifications'

const Header = () => {
  const [rate, setRate] = useState(1500)
  return (
    <>
      <HamburgerMenu />
      <Notifications />
      <div className='mx-20 font-jaro text-3xl'>HOME</div>
      {/* <span className="material-icons">notifications</span> */}
      <div className="">
        <div className="flex flex-col">
        </div>
        <img src={MTH} alt="" className="rounded-full h-12 w-12 ml-2 mr-4" />
      </div>
    </>
  )
}

export default Header