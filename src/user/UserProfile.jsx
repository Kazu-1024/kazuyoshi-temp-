import React, {useState} from 'react'

const UserProfile = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="absolute bottom-[10%] left-2 mb-2">
                <button onClick={() => setIsOpen(true)}>
                    <img src={HelpCircle} role="presentation" draggable="false" className="w-10 h-10" alt="Help" />
                </button>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="relative w-11/12 max-w-md rounded-lg bg-zinc-800 shadow-lg">
                        <div className="flex items-center p-2">
                            <img src={hamburgerIcon} alt="hamburgerIcon" className="h-6 w-6" />
                            <p className="ml-4 text-white text-lg font-bold font-francois">Help</p>
                            <button onClick={() => setIsOpen(false)} className="ml-auto">
                                <img src={close} alt="close" className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-white rounded-b-lg p-6 h-96">
                            <></>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserProfile