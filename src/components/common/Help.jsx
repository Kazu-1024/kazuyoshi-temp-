import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import HelpCircle from '../../assets/images/HelpCircle.png'
import hamburgerIcon from "../../assets/images/hamburgerIcon.png";
import close from "../../assets/images/close.png"
import oneOnone from "../../assets/images/oneOnOne.png"

const Help = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [helpContent, setHelpContent] = useState(false);
    const [helpImage, setHelpImage] = useState("");  // 画像を追加
    const location = useLocation();

    useEffect(() => {
        const pageHelpData = {
            "/": {
                content: "5ミス5答の1対1の対戦形式。対戦ジャンルを選び、 playボタンを押しましょう。 対戦が始まると、早押しボタンで回答権を得ます。",
                image: oneOnone
            },
        }

        const currentPage = pageHelpData[location.pathname.toLowerCase()] || {
            content: "5ミス5答の1対1の対戦形式。対戦ジャンルを選び、 playボタンを押しましょう。 対戦が始まると、早押しボタンで回答権を得ます。",
            image: oneOnone  // デフォルト画像
        };

        setHelpContent(currentPage.content);
        setHelpImage(currentPage.image);
    }, [location])

    return (
        <>
            <div className="absolute bottom-[10%] left-2 mb-2">
                <button onClick={() => setIsOpen(true)}>
                    <img src={HelpCircle} role="presentation" draggable="false" className="w-10 h-10" alt="Help" />
                </button>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="relative w-11/12 max-w-md rounded-lg bg-gray-700 shadow-lg">
                        <div className="flex items-center p-2">
                            <img src={hamburgerIcon} alt="hamburgerIcon" className="h-6 w-6" />
                            <p className="ml-4 text-white text-lg font-bold font-francois">Help</p>
                            <button onClick={() => setIsOpen(false)} className="ml-auto">
                                <img src={close} alt="close" className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-white rounded-b-lg p-6 h-96">
                            <div className="h-[50%] w-2/3 mx-auto">
                                <img src={helpImage} alt="helpImage" role="presentation" draggable="false" className="h-full w-full object-contain" />
                            </div>
                            <div className="relative w-full">
                                <div className="absolute inset-x-4 border-t border-gray-600"/>
                            </div>
                            <div className="text-xl mt-3">
                                {helpContent}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Help