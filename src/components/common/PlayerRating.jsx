import React, {useState, useEffect} from 'react'
import ratingBg from '../../assets/images/ratingBg.png'

const PlayerRating = ({ username }) => {
    const [playerRate, setPlayerRate] = useState(1500);

    useEffect(() => {
        const fetchRating = async () => {
            try{
                const endpoint = username ? `http://localhost:8080/rate/user?username=${username}` : "http://localhost:8080/rate/user";

                const response = await fetch(endpoint, {
                    method: "GET",
                    credentials: "include"
                });
            } catch (error) {
                console.error(error);
            }
        };
    }, [username]);

    const positionStyle = {
        "home": "absolute right-1 top-1",
        "resultWinners": ""
    }
    return (
        <>
            <div className="absolute" >
                <div className="relative">
                    <img src={ratingBg} alt="ratingBg" role="presentation" draggable="false" className="w-full h-full object-contain" />
                    <p className="absolute">
                        {playerRate}
                    </p>
                </div>

            </div>
        </>
    )
}

export default PlayerRating