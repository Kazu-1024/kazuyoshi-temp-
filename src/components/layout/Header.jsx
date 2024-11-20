import React, {useState} from 'react'
import HamburgerMenu from './HamburgerMenu'
import MTH from '../../assets/images/MTH.png'

const Header = () => {
  const [rate, setRate] = useState(1500)
  return (
    <>
      <HamburgerMenu />
      <span className="material-icons">notifications</span>
      <div className="w-full flex justify-end items-center border-y-4 border-l-4 rounded-bl-3xl rounded-tl-xl border-black py-3 ml-24">
        <div className="flex flex-col">
          <p>ユーザーネーム</p>
          <p>レート: {rate}</p>
        </div>
        <img src={MTH} alt="" className="rounded-full h-12 w-12 ml-2 mr-4" />
      </div>
    </>
  )
}

export default Header